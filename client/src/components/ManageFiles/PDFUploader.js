import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

const PDFUploader = () => {
  const [file, setFile] = useState(null);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]); // Store the selected PDF file
      uploadFile(acceptedFiles[0]);
    }
  }, []);

  const uploadFile = async (pdfFile) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("pdfFile", pdfFile); // Ensure it matches backend's expected key

    try {
      const response = await fetch(
        "http://localhost:5000/api/upload-to-openai",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      setResponse(data.response); // Store OpenAI's response
    } catch (error) {
      console.error("Error uploading file:", error);
      setResponse("❌ Error processing file.");
    }
    setLoading(false);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: ".pdf",
  });

  return (
    <div style={{ maxWidth: "600px", margin: "auto", textAlign: "center" }}>
      <div
        {...getRootProps()}
        style={{
          border: "2px dashed #ccc",
          padding: "20px",
          cursor: "pointer",
          marginBottom: "15px",
        }}
      >
        <input {...getInputProps()} />
        <p>Drag & drop a PDF file here, or click to select one</p>
      </div>

      {file && <p>📂 Selected file: {file.name}</p>}

      {loading ? (
        <p>⏳ Processing...</p>
      ) : (
        response && (
          <div>
            <h3>🤖 OpenAI Response:</h3>
            <p style={{ whiteSpace: "pre-wrap", textAlign: "left" }}>
              {response}
            </p>
          </div>
        )
      )}
    </div>
  );
};

export default PDFUploader;
