/**
 * NeuraAI – Transcription, Quiz, Smart Notes
 * Replace the API_BASE and implement backend endpoints for production.
 * For YouTube: backend must fetch audio/transcript (e.g. Whisper, YouTube transcript API).
 */

const API_BASE = '/api/ai'; // Set to your backend base; use mock if not available

const NeuraAI = {
    /**
     * Generate transcription from video content.
     * Backend: POST /api/ai/transcribe { videoUrl, lessonTitle }
     * Returns: { transcript: string }
     */
    async generateTranscription(lessonTitle, videoUrl) {
        try {
            const res = await fetch(API_BASE + '/transcribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ videoUrl: videoUrl || '', lessonTitle: lessonTitle || '' })
            });
            if (res.ok) {
                const data = await res.json();
                return data.transcript || data.text || '';
            }
        } catch (e) { /* no backend */ }
        return await mockTranscription(lessonTitle, videoUrl);
    },

    /**
     * Generate quiz from transcript.
     * Backend: POST /api/ai/quiz { transcript }
     * Returns: { questions: [{ question, options[], correctIndex }] }
     */
    async generateQuiz(transcript) {
        try {
            const res = await fetch(API_BASE + '/quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transcript: transcript || '' })
            });
            if (res.ok) {
                const data = await res.json();
                return data.questions ? formatQuiz(data) : data;
            }
        } catch (e) { /* no backend */ }
        return await mockQuiz(transcript);
    },

    /**
     * Generate smart notes from transcript.
     * Backend: POST /api/ai/notes { transcript }
     * Returns: { notes: string }
     */
    async generateSmartNotes(transcript) {
        try {
            const res = await fetch(API_BASE + '/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transcript: transcript || '' })
            });
            if (res.ok) {
                const data = await res.json();
                return data.notes || data.text || '';
            }
        } catch (e) { /* no backend */ }
        return await mockSmartNotes(transcript);
    }
};

function formatQuiz(data) {
    const q = data.questions;
    if (!Array.isArray(q)) return String(data);
    return q.map((x, i) => {
        const opts = x.options || x.choices || [];
        const correct = x.correctIndex != null ? x.correctIndex : x.correct;
        return `${i + 1}. ${x.question || x.q}\n   Options: ${opts.join(', ')}\n   Correct: ${opts[correct] || opts[0]}`;
    }).join('\n\n');
}

async function mockTranscription(lessonTitle, videoUrl) {
    await new Promise(r => setTimeout(r, 1200));
    if (videoUrl && (videoUrl.includes('youtube') || videoUrl.includes('youtu.be')))
        return `[Transcription for "${lessonTitle || 'Lesson'}" – YouTube content. In production, use backend with Whisper or YouTube transcript API to generate real transcription from video/audio.]`;
    return `[Transcription for "${lessonTitle || 'Lesson'}". In production, send video/audio to your backend (e.g. Whisper API) and return the transcript here.]`;
}

async function mockQuiz(transcript) {
    await new Promise(r => setTimeout(r, 1000));
    const snippet = (transcript || '').slice(0, 200) || 'this lesson';
    return `1. What is a key concept covered in this lesson?\n   A) Introduction  B) Core topic  C) Summary  D) Conclusion\n   Correct: B\n\n2. Based on the content, which applies?\n   A) Basic  B) Intermediate  C) Advanced  D) All\n   Correct: D\n\n[Replace with real AI-generated quiz from transcript via your backend LLM.]`;
}

async function mockSmartNotes(transcript) {
    await new Promise(r => setTimeout(r, 1000));
    const snippet = (transcript || '').slice(0, 300) || 'the lesson content';
    return `Smart notes (summary):\n• Main idea: ${snippet}\n• Key terms and definitions.\n• Takeaways and action items.\n\n[In production, use your backend LLM to generate notes from the full transcript.]`;
}
