const generateAction = async (req, res) => {
    const bufferToBase64 = (buffer) => {
        let arr = new Uint8Array(buffer);
        const base64 = btoa(
            arr.reduce((data, byte) => data + String.fromCharCode(byte), '')
        )
        return `data:image/png;base64,${base64}`;
    };
    console.log('Received request')
    const input = JSON.parse(req.body).input;
    // Add fetch request to Hugging Face
    const response = await fetch(
        `https://api-inference.huggingface.co/models/grombardur/svsoenso`,
        {
            headers: {
                Authorization: `Bearer ${process.env.HF_AUTH_KEY}`,
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify({
                inputs: input,
            }),
        }
    );
    // Check for different statuses to send proper payload
    if (response.ok) {
        console.log(response.body);
        const buffer = await response.arrayBuffer();
        const base64 = bufferToBase64(buffer);
        res.status(200).json({ image: base64 });
    } else if (response.status === 503) {
        console.log("503");
        const json = await response.json();
        res.status(503).json(json);
    } else {
        console.log(res.status);
        const json = await response.json();
        res.status(response.status).json({ error: response.statusText });
    }
}

export default generateAction;