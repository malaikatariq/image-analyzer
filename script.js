<script>
async function analyze() {
    const file = document.getElementById("fileInput").files[0];
    if (!file) return alert("Select an image");

    // Convert image to Base64
    const reader = new FileReader();
    reader.onload = async () => {
        const base64 = reader.result.split(",")[1]; // remove data:image prefix

        // Call your Azure Function
        const functionUrl = "https://image-analyzer-fdatfkbtcrbxb3cp.westeurope-01.azurewebsites.net/api/analyzeimage?code=DRj0Fbh4BG5M9_oH4MfSMJXwTaaes2YBG41OTQT73S63AzFuo4kP3A=="; // include ?code=

        try {
            const res = await fetch(functionUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ imageBase64: base64 })
            });

            if (!res.ok) throw new Error("Function call failed");

            const data = await res.json(); // data.faces contains detected faces
            console.log(data);

            // Draw image and faces
            const img = new Image();
            img.src = reader.result;
            img.onload = () => {
                const canvas = document.getElementById("canvas");
                const ctx = canvas.getContext("2d");
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                // Draw rectangles and show details
                document.getElementById("result").innerHTML = "";
                (data.faces || []).forEach((face, i) => {
                    const r = face.faceRectangle;
                    ctx.strokeStyle = "red";
                    ctx.lineWidth = 2;
                    ctx.strokeRect(r.left, r.top, r.width, r.height);
                    ctx.fillStyle = "red";
                    ctx.fillText(`${face.gender}, ${face.age}`, r.left, r.top - 5);

                    document.getElementById("result").innerHTML += 
                        `Face ${i+1}: ${face.gender}, Age ${face.age}<br>`;
                });
            };
        } catch (err) {
            console.error(err);
            alert("Error analyzing image. Check console.");
        }
    };

    reader.readAsDataURL(file);
}
</script>
