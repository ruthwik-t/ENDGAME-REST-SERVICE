const express = require('express');
const xmlparser = require('express-xml-bodyparser');
const ntlm = require('express-ntlm');
const app = express();

// Middleware
app.use(express.json());
app.use(xmlparser());

// 1. REST endpoints returning XML
app.get('/xml/get', (req, res) => {
    res.set('Content-Type', 'application/xml');
    res.send('<response><message>Hello from GET XML</message></response>');
});

app.post('/xml/post', (req, res) => {
    res.set('Content-Type', 'application/xml');
    res.send('<response><message>Hello from POST XML</message></response>');
});

app.put('/xml/put', (req, res) => {
    res.set('Content-Type', 'application/xml');
    res.send('<response><message>Hello from PUT XML</message></response>');
});

app.delete('/xml/delete', (req, res) => {
    res.set('Content-Type', 'application/xml');
    res.send('<response><message>Hello from DELETE XML</message></response>');
});

// 2. REST endpoints returning JSON
app.get('/json/get', (req, res) => {
    res.json({ message: 'Hello from GET JSON' });
});

app.post('/json/post', (req, res) => {
    res.json({ message: 'Hello from POST JSON' });
});

app.put('/json/put', (req, res) => {
    res.json({ message: 'Hello from PUT JSON' });
});

app.delete('/json/delete', (req, res) => {
    res.json({ message: 'Hello from DELETE JSON' });
});

// Endpoint that echoes back the request as response
app.post('/echo', (req, res) => {
    res.json({
        status: 'success',
        received: req.body
    });
});

app.post('/echos', (req, res) => {
    res.json({
        status: 'success',
        received: req.body
    });
});

// 3. REST endpoint with Basic Auth
app.get('/basic-auth', (req, res) => {
    const auth = req.headers['authorization'];
    
    if (!auth) {
        res.set('WWW-Authenticate', 'Basic realm="Restricted Area"');
        return res.status(401).send('Authentication required');
    }

    const [type, credentials] = auth.split(' ');
    if (type !== 'Basic') {
        return res.status(401).send('Invalid authentication type');
    }

    const [username, password] = Buffer.from(credentials, 'base64')
        .toString()
        .split(':');
    
    if (username === 'admin' && password === 'password123') {
        res.json({
            status: 'success',
            data: {
                id: 1,
                name: 'Protected Data',
                timestamp: new Date()
            }
        });
    } else {
        res.status(401).send('Invalid credentials');
    }
});

// 4. POST endpoint accepting specific XML structure
app.post('/xml-specific', (req, res) => {
    const xmlData = req.body;
    
    // Expected structure: <user><name>string</name><age>number</age></user>
    if (!xmlData.user || !xmlData.user.name || !xmlData.user.age) {
        res.status(400).send('Invalid XML structure');
        return;
    }

    res.json({
        status: 'success',
        received: {
            name: xmlData.user.name,
            age: xmlData.user.age
        }
    });
});

// 5. POST endpoint accepting specific JSON structure
app.post('/json-specific', (req, res) => {
    const jsonData = req.body;
    
    // Expected structure: { "user": { "name": string, "age": number } }
    if (!jsonData.user || !jsonData.user.name || !jsonData.user.age) {
        res.status(400).send('Invalid JSON structure');
        return;
    }

    res.json({
        status: 'success',
        received: {
            name: jsonData.user.name,
            age: jsonData.user.age
        }
    });
});

// 6. Endpoint with NTLM Authentication
app.use('/ntlm', ntlm());
app.get('/ntlm/protected', (req, res) => {
    res.json({
        status: 'success',
        user: req.ntlm, // Contains NTLM authentication details
        message: 'NTLM protected endpoint'
    });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
