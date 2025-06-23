const axios = require('axios');
const Chat = require('../models/chat.model');

const openrouterApiKey = process.env.OPENROUTER_API_KEY;

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';

exports.personalizeEmail = async (req, res) => {
  if (!openrouterApiKey) return res.status(500).json({ error: 'OpenRouter API key not set.' });
  const { content, recipient, company, resume, linkedin, prompt: customPrompt, hrName, senderName } = req.body;
  try {
    let prompt = `Personalize the following email for the recipient using any available details (company: ${company || 'N/A'}, LinkedIn: ${linkedin || 'N/A'}, resume: ${resume || 'N/A'}`;
    if (hrName) prompt += `, hiring manager name: ${hrName}`;
    if (senderName) prompt += `, sender name: ${senderName}`;
    prompt += ').';
    if (customPrompt) prompt += `\n\nCustom instructions: ${customPrompt}`;
    prompt += `\n\nEmail draft:\n${content}`;
    const response = await axios.post(
      OPENROUTER_BASE_URL,
      {
        model: 'mistralai/mistral-7b-instruct',
        messages: [
          { role: 'system', content: 'You are an expert email assistant.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${openrouterApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    const aiContent = response.data.choices[0].message.content;
    return res.json({ content: aiContent });
  } catch (err) {
    console.error('OpenRouter error:', err?.response?.data || err);
    return res.status(500).json({ error: 'AI personalization failed.' });
  }
};

exports.chatWithAI = async (req, res) => {
  if (!openrouterApiKey) return res.status(500).json({ error: 'OpenRouter API key not set.' });
  const userId = req.user?._id;
  const { chatId, message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required.' });

  let chat;
  if (chatId) {
    chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ error: 'Chat not found.' });
  } else {
    chat = new Chat({ user: userId, messages: [] });
  }

  // Add user message
  chat.messages.push({ role: 'user', content: message });

  // If this is the first user message, generate a short description
  if (chat.messages.length === 1) {
    try {
      const descPrompt = `Summarize this chat in 5-6 words: ${message}`;
      const descResponse = await axios.post(
        OPENROUTER_BASE_URL,
        {
          model: 'mistralai/mistral-7b-instruct',
          messages: [
            { role: 'system', content: 'You are a helpful AI assistant.' },
            { role: 'user', content: descPrompt }
          ],
          max_tokens: 20
        },
        {
          headers: {
            'Authorization': `Bearer ${openrouterApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      const desc = descResponse.data.choices[0].message.content.trim().replace(/^"|"$/g, '');
      chat.description = desc;
      // Emit chat updated event
      const io = req.app.get('io');
      io.emit('chat:updated', { _id: chat._id, description: desc });
    } catch (err) {
      chat.description = '';
    }
  }

  // Prepare messages for OpenRouter
  const messages = chat.messages.map(m => ({ role: m.role, content: m.content }));

  try {
    // Stream response line by line
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    let aiContent = '';
    const response = await axios.post(
      OPENROUTER_BASE_URL,
      {
        model: 'mistralai/mistral-7b-instruct',
        messages: [
          { role: 'system', content: 'You are a helpful AI assistant. Always provide the full, detailed answer in one response, unless the user specifically asks for a summary.' },
          ...messages
        ],
        max_tokens: 2048
      },
      {
        headers: {
          'Authorization': `Bearer ${openrouterApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    aiContent = response.data.choices[0].message.content;
    // Stream line by line
    const lines = aiContent.split(/\r?\n/).filter(Boolean);
    for (const line of lines) {
      res.write(`data: ${JSON.stringify({ line })}\n\n`);
      await new Promise(r => setTimeout(r, 40)); // Simulate streaming
    }
    // Add AI message to chat
    chat.messages.push({ role: 'assistant', content: aiContent });
    await chat.save();
    res.write(`data: ${JSON.stringify({ done: true, chatId: chat._id })}\n\n`);
    res.end();
  } catch (err) {
    console.error('OpenRouter error:', err?.response?.data || err);
    res.write(`data: ${JSON.stringify({ error: 'AI chat failed.' })}\n\n`);
    res.end();
  }
};

// Get recent chats for sidebar
exports.getRecentChats = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 20;
    const chats = await Chat.find({ user: userId })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('_id createdAt updatedAt description');
    res.json({ data: chats });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recent chats.' });
  }
};

// Create a new chat
exports.createChat = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const chat = new Chat({ user: userId, messages: [] });
    await chat.save();
    // Emit new chat event
    const io = req.app.get('io');
    io.emit('chat:new', { _id: chat._id, createdAt: chat.createdAt, updatedAt: chat.updatedAt, description: chat.description });
    res.status(201).json({ data: { _id: chat._id, createdAt: chat.createdAt } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create chat.' });
  }
};

// Delete empty chat
exports.deleteEmptyChat = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { chatId } = req.params;
    const chat = await Chat.findOne({ _id: chatId, user: userId });
    if (!chat) return res.status(404).json({ error: 'Chat not found.' });
    if (chat.messages.length === 0) {
      await chat.deleteOne();
      // Emit chat deleted event
      const io = req.app.get('io');
      io.emit('chat:deleted', { _id: chatId });
      return res.status(200).json({ message: 'Empty chat deleted.' });
    } else {
      return res.status(400).json({ error: 'Chat is not empty.' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete chat.' });
  }
};

// Get chat messages/history for a chat
exports.getChatMessages = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { chatId } = req.params;
    const chat = await Chat.findOne({ _id: chatId, user: userId });
    if (!chat) return res.status(404).json({ error: 'Chat not found.' });
    res.json({ data: chat.messages });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch chat messages.' });
  }
};

// Rename a chat
exports.renameChat = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { chatId } = req.params;
    const { description } = req.body;
    
    if (!description || description.trim() === '') {
      return res.status(400).json({ error: 'Description is required.' });
    }
    
    const chat = await Chat.findOne({ _id: chatId, user: userId });
    if (!chat) return res.status(404).json({ error: 'Chat not found.' });
    
    chat.description = description.trim();
    await chat.save();
    
    // Emit chat updated event
    const io = req.app.get('io');
    io.emit('chat:updated', { _id: chatId, description: chat.description });
    
    res.json({ data: { _id: chat._id, description: chat.description } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to rename chat.' });
  }
};

// Delete a chat (any chat, not just empty ones)
exports.deleteChat = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { chatId } = req.params;
    
    const chat = await Chat.findOne({ _id: chatId, user: userId });
    if (!chat) return res.status(404).json({ error: 'Chat not found.' });
    
    await chat.deleteOne();
    
    // Emit chat deleted event
    const io = req.app.get('io');
    io.emit('chat:deleted', { _id: chatId });
    
    res.json({ message: 'Chat deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete chat.' });
  }
}; 