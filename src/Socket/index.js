/* Elaina Baileys & Gopyr Baileys maintained distribution. Upstream notices and license are preserved in LICENSE and NOTICE.md. */
import { DEFAULT_CONNECTION_CONFIG } from '../Defaults/index.js';
import { prepareModernMessageContent } from '../Utils/modern-messages.js';
import { makeNewsletterStatusFetcher, makeNewsletterStatusUpdatesFetcher, makeNewsletterStatusReactionSender, makeNewsletterStatusRevokeSender, makeNewsletterStatusSender } from '../Utils/newsletter-status.js';
import { bindVoiceRecognition } from '../Utils/voice-recognition.js';
import { makeCommunitiesSocket } from './communities.js';
import { createAnchorGuard } from '../Utils/anchor-guard.js';

const makeWASocket = (config) => {
    const newConfig = {
        ...DEFAULT_CONNECTION_CONFIG,
        ...config
    };
    const sock = makeCommunitiesSocket(newConfig);
    bindVoiceRecognition(sock, newConfig);
    const sendMessage = sock.sendMessage.bind(sock);
    sock.sendMessage = (jid, content, options = {}) => sendMessage(jid, prepareModernMessageContent(content), options);
    sock.sendNewsletterStatus = makeNewsletterStatusSender(sock, newConfig);
    sock.sendNewsletterStatusReaction = makeNewsletterStatusReactionSender(sock);
    sock.revokeNewsletterStatus = makeNewsletterStatusRevokeSender(sock);
    sock.getNewsletterStatuses = makeNewsletterStatusFetcher(sock);
    sock.getNewsletterStatusUpdates = makeNewsletterStatusUpdatesFetcher(sock);


    if (newConfig.AnchorGuard) {
        // AnchorGuard internal (recode dari elaina-anchorguard, MIT) — tanpa dependensi eksternal.
        sock.anchorGuard = createAnchorGuard(sock, { logger: sock.logger, ...(newConfig.AnchorGuardConfig || {}) });
    }
    return sock;
};
export default makeWASocket;
