const generateAction = async (req, res) => {
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
        res.status(200).json({ image: buffer });
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