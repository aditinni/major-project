const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');

router.post('/', (req, res) => {
    const inputText = req.body.text;
    
    // Spawn a child process to run the Python script
    const pythonProcess = spawn('python', ['scripts/summarizer.py', inputText]);

    let summary = '';
    pythonProcess.stdout.on('data', (data) => {
        summary += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Error: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        if (code === 0) {
            res.render('summarize', { summary });
        } else {
            res.status(500).send('Error generating summary.');
        }
    });
});

module.exports = router;
