"use strict";
// Gopyr rich-message-block — recode dari raiden-baileys (MIT) untuk Gopyr-Baileys.
// Membangun m.richResponseMessage/botMetadata dari konten { text, code, table, html, image, video, title, editrich }.
import { extractIE, waitAllPromises, tokenizer, toTableMetadata, newLayout, normalizeRichInlineEntities } from "./rich-message.js";

export async function buildRichMessage(m, rich, options) {
    const submessages = [];
    const sections = [];
    const richResponseSources = [];
    const unifiedData = { structured: [] };

    if (rich.text) {
        let finalText = String(rich.text);
        finalText = finalText.replace(/\[citation\]\((.+?)\)/g, (match, url) => `[](\n${url})`);
        const parsed = extractIE(finalText);
        const text = parsed.text || parsed;
        const inline_entities = [
            ...(parsed.ie ? parsed.ie.map(({ type, ie }) => {
                if (type === 'hyperlink') return { key: ie.key, metadata: { display_name: ie.text, is_trusted: ie.is_trusted, url: ie.url, __typename: 'GenAIInlineLinkItem' } };
                if (type === 'citation') return { key: ie.key, metadata: { reference_id: ie.reference_id, reference_url: ie.url, reference_title: ie.url, reference_display_name: ie.url, sources: [], __typename: 'GenAISearchCitationItem' } };
                if (type === 'latex') return { key: ie.key, metadata: { latex_expression: ie.text || '', latex_image: { url: ie.url, width: Number(ie.width) || 100, height: Number(ie.height) || 100 }, font_height: Number(ie.font_height) || 83.33, padding: Number(ie.padding) || 15, __typename: 'GenAILatexItem' } };
                return null;
            }).filter(Boolean) : []),
            ...normalizeRichInlineEntities(rich.inline_entities)
        ];
        submessages.push({ messageType: 2, messageText: text });
        sections.push(newLayout('Single', { text, ...(inline_entities.length && { inline_entities }), __typename: 'GenAIMarkdownTextUXPrimitive' }));
    }

    if (rich.code) {
        const { language, code } = rich.code;
        const tok = tokenizer(code, language);
        submessages.push({ messageType: 5, codeMetadata: { codeLanguage: language, codeBlocks: tok.codeBlock } });
        sections.push(newLayout('Single', { language, code_blocks: tok.unified_codeBlock, __typename: 'GenAICodeUXPrimitive' }));
    }

    if (rich.table) {
        const meta = toTableMetadata(rich.table);
        submessages.push({ messageType: 4, tableMetadata: { title: meta.title, rows: meta.rows } });
        sections.push(newLayout('Single', { rows: meta.unified_rows, __typename: 'GenATableUXPrimitive' }));
    }

    if (rich.html) {
        const html = typeof rich.html === 'string' ? rich.html : String(rich.html);
        const htmlText = rich.text || rich.title || 'Rich HTML';
        if (!rich.text) submessages.push({ messageType: 2, messageText: htmlText });
        sections.push({ view_model: { primitive: { __typename: 'GenAIaeacdsnwHtmlPrimitive', payload: html, trusted_sources: [] }, __typename: 'GenAISingleLayoutViewModel' } });
    }

    if (rich.image) {
        const url = rich.image;
        submessages.push({ messageType: 1, gridImageMetadata: { gridImageUrl: { imagePreviewUrl: url }, imageUrls: [{ imagePreviewUrl: url, imageHighResUrl: url, sourceUrl: url }] } });
        sections.push(newLayout('Single', { media: { url, mime_type: 'image/jpeg' }, __typename: 'GenAIMediaUXPrimitive' }));
    }

    if (rich.video) {
        const url = rich.video;
        submessages.push({ messageType: 1, gridVideoMetadata: { gridVideoUrl: { videoPreviewUrl: url }, videoUrls: [{ videoPreviewUrl: url, videoHighResUrl: url, sourceUrl: url }] } });
        sections.push(newLayout('Single', { media: { url, mime_type: 'video/mp4' }, __typename: 'GenAIMediaUXPrimitive' }));
    }

    if (rich.sources && Array.isArray(rich.sources)) {
        for (const src of rich.sources.slice(0, 20)) {
            if (typeof src === 'string') {
                richResponseSources.push({ sourceUrl: src, sourceTitle: src, __typename: 'GenAISearchSourceItem' });
                unifiedData.structured.push({ type: 'source', url: src });
            }
        }
    }

    m.botMetadata = {
        messageDisclaimerText: rich.title || '',
        richResponseSourcesMetadata: { sources: richResponseSources }
    };
    m.botForwardedMessage = {
        message: {
            richResponseMessage: {
                messageType: 1,
                submessages: await waitAllPromises(submessages),
                unifiedResponse: { data: Buffer.from(JSON.stringify(unifiedData)).toString('base64') },
                contextInfo: { forwardingScore: 1, isForwarded: true, forwardedAiBotMessageInfo: { botJid: '0@bot' }, forwardOrigin: 4 }
            }
        }
    };
}
