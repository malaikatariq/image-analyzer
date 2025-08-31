// Replace with your Function App URL including ?code=
const apiUrl = "https://image-analyzer-fdatfkbtcrbxb3cp.westeurope-01.azurewebsites.net/api/analyzeimage?code=DRj0Fbh4BG5M9_oH4MfSMJXwTaaes2YBG41OTQT73S63AzFuo4kP3A==";

async function analyzeImage() {
    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];
    if (!file) return alert("Please select an image");

    const reader = new FileReader();
    reader.onload = async () => {
        // Remove the prefix "data:image/...;base64,"
        const base64 = reader.result.split(",")[1];

        try {
            // Call Azure Function
            const res = await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ imageBase64: base64 })
            });

            if (!res.ok) throw new Error("Function call failed");

            const data = await res.json();
            console.log("Response from Function:", data);

            // Draw image and detected faces
            const img = new Image();
            img.src = reader.result;
            img.onload = () => {
                const canvas = document.getElementById("canvas");
                const ctx = canvas.getContext("2d");
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                // Clear previous results
                const resultDiv = document.getElementById("result");
                resultDiv.innerHTML = "";

                (data.faces || []).forEach((face, i) => {
                    const r = face.faceRectangle;
                    ctx.strokeStyle = "red";
                    ctx.lineWidth = 2;
                    ctx.strokeRect(r.left, r.top, r.width, r.height);
                    ctx.fillStyle = "red";
                    ctx.fillText(`${face.gender}, ${face.age}`, r.left, r.top - 5);

                    resultDiv.innerHTML += `Face ${i+1}: ${face.gender}, Age ${face.age}<br>`;
                });
            };

        } catch (err) {
            console.error("Error analyzing image:", err);
            alert("Error analyzing image. Check console for details.");
        }
    };

    reader.readAsDataURL(file);
}

// Example usage: connect to a button
document.getElementById("analyzeBtn").addEventListener("click", analyzeImage);
