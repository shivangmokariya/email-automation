const Campaign = require('../models/campaign.model');
const Credential = require('../models/credential.model');
const sendEmailUtil = require('../utils/email');
const { decrypt } = require('../utils/crypto');

// Utility to create a transporter with credentials from DB
const createTransporter = async (credentialId, userId) => {
    const credential = await Credential.findOne({ _id: credentialId, user: userId });
    if (!credential) {
        throw new Error('Email credential not found or you do not have permission to use it.');
    }
    const password = decrypt(credential.appPassword);

    return {
        transporterConfig: {
            service: 'gmail',
            auth: {
                user: credential.email,
                pass: password,
            },
        },
        from: `"${credential.name || credential.email}" <${credential.email}>`
    };
};

// Controller to send a single email and track it as a campaign
exports.sendSingleEmail = async (req, res) => {
    const { to, subject, content, credentialId, hrName, company, position } = req.body;
    let campaign;

    try {
        const { transporterConfig, from } = await createTransporter(credentialId, req.user.id);
        transporterConfig.from = from;

        // Create a campaign for this single email to track it
        campaign = new Campaign({
            user: req.user.id,
            name: `Single email to: ${to}`,
            subject: subject,
            template: content,
            status: 'in-progress',
            recipients: [{ email: to, name: hrName, company, position, status: 'pending' }]
        });
        await campaign.save();

        await sendEmailUtil({
            transporterConfig,
            to,
            subject,
            text: content,
            attachments: req.file ? [{ filename: req.file.originalname, path: req.file.path }] : []
        });

        // If email sends successfully, update the campaign record
        campaign.status = 'completed';
        campaign.sentCount = 1;
        campaign.recipients[0].status = 'sent';
        campaign.recipients[0].sentAt = Date.now();
        await campaign.save();

        res.status(200).json({ status: 'success', message: 'Email sent and recorded successfully!' });

    } catch (error) {
        console.error("Failed to send single email:", error);

        // If email fails, update the campaign record to reflect failure
        if (campaign) {
            campaign.status = 'failed';
            campaign.failedCount = 1;
            campaign.recipients[0].status = 'failed';
            campaign.recipients[0].error = error.message;
            await campaign.save();
        }
        
        res.status(500).json({ status: 'error', message: 'Failed to send email. Check server logs for details.' });
    }
};

// Controller to send bulk emails and track them as a campaign
exports.sendBulkEmail = async (req, res) => {
    const { subject, content, credentialId, campaignName, recipients } = req.body;
    let campaign;

    try {
        // Parse recipients from text (one email per line)
        const emailList = recipients
            .split('\n')
            .map(email => email.trim())
            .filter(email => email && email.includes('@')); // Basic email validation

        if (emailList.length === 0) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'No valid email addresses found. Please enter at least one valid email address.' 
            });
        }

        const { transporterConfig, from } = await createTransporter(credentialId, req.user.id);
        transporterConfig.from = from;

        // Create a campaign for this bulk email
        campaign = new Campaign({
            user: req.user.id,
            name: campaignName,
            subject: subject,
            template: content,
            status: 'in-progress',
            recipients: emailList.map(email => ({ 
                email, 
                status: 'pending' 
            }))
        });
        await campaign.save();

        let sentCount = 0;
        let failedCount = 0;

        // Send emails to each recipient
        for (let i = 0; i < emailList.length; i++) {
            const email = emailList[i];
            try {
                await sendEmailUtil({
                    transporterConfig,
                    to: email,
                    subject,
                    text: content,
                    attachments: req.file ? [{ filename: req.file.originalname, path: req.file.path }] : []
                });

                // Update recipient status to sent
                campaign.recipients[i].status = 'sent';
                campaign.recipients[i].sentAt = Date.now();
                sentCount++;

            } catch (error) {
                console.error(`Failed to send email to ${email}:`, error);
                campaign.recipients[i].status = 'failed';
                campaign.recipients[i].error = error.message;
                failedCount++;
            }
        }

        // Update campaign status
        campaign.sentCount = sentCount;
        campaign.failedCount = failedCount;
        campaign.status = failedCount === 0 ? 'completed' : (sentCount > 0 ? 'partial' : 'failed');
        await campaign.save();

        const message = failedCount === 0 
            ? `All ${sentCount} emails sent successfully!`
            : `${sentCount} emails sent successfully, ${failedCount} failed.`;

        res.status(200).json({ 
            status: 'success', 
            message,
            stats: { sent: sentCount, failed: failedCount, total: emailList.length }
        });

    } catch (error) {
        console.error("Failed to send bulk emails:", error);

        // If campaign creation fails, update the campaign record to reflect failure
        if (campaign) {
            campaign.status = 'failed';
            campaign.failedCount = campaign.recipients.length;
            campaign.recipients.forEach(recipient => {
                recipient.status = 'failed';
                recipient.error = error.message;
            });
            await campaign.save();
        }
        
        res.status(500).json({ 
            status: 'error', 
            message: 'Failed to send bulk emails. Check server logs for details.' 
        });
    }
}; 