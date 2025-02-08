const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/ddpzupkmg/image/upload";
const CLOUDINARY_UPLOAD_PRESET = "gjzlvxav"; // Get from Cloudinary settings

document
  .getElementById("fileInput")
  .addEventListener("change", uploadToCloudinary);
document
  .getElementById("uploadBox")
  .addEventListener("dragover", (e) => e.preventDefault());
document.getElementById("uploadBox").addEventListener("drop", (e) => {
  e.preventDefault();
  uploadToCloudinary({ target: { files: e.dataTransfer.files } });
});

function uploadToCloudinary(event) {
  const files = event.target.files;
  if (!files.length) return;

  const loader = document.getElementById("loader");
  const errorBox = document.getElementById("errorBox");
  errorBox.innerHTML = ""; // Clear previous errors
  loader.classList.remove("hidden"); // Show loader

  Array.from(files).forEach((file) => {
    if (!file.type.startsWith("image/")) {
      showError("Only image files are allowed (JPEG, PNG, GIF, etc.).");
      loader.classList.add("hidden");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      showError(
        "File size is too large. Please upload images smaller than 10MB."
      );
      loader.classList.add("hidden");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    fetch(CLOUDINARY_URL, {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok)
          throw new Error("Failed to upload. Please try again later.");
        return response.json();
      })
      .then((data) => {
        if (data.secure_url) {
          saveImageLocally(data.secure_url);
          displayImages(); // Refresh gallery
        } else {
          throw new Error("Unexpected response from server.");
        }
      })
      .catch((error) => {
        showError(error.message);
      })
      .finally(() => {
        loader.classList.add("hidden"); // Hide loader in all cases
      });
  });
}

// Function to Save Image URL in Local Storage
function saveImageLocally(url) {
  let uploadedImages = JSON.parse(localStorage.getItem("uploadedImages")) || [];
  uploadedImages.push(url);
  localStorage.setItem("uploadedImages", JSON.stringify(uploadedImages));
}

// Function to Display Image in Gallery
function displayImage(url) {
  const gallery = document.getElementById("gallery");
  const img = document.createElement("img");
  img.src = url;
  gallery.appendChild(img);
}

// Function to Show Error Message
function showError(message) {
  const errorBox = document.getElementById("errorBox");
  const errorMsg = document.createElement("div");
  errorMsg.classList.add("error-message");
  errorMsg.textContent = message;
  errorBox.appendChild(errorMsg);
}

// Function to Display All Uploaded Images
function displayImages() {
  const gallery = document.getElementById("gallery");
  gallery.innerHTML = ""; // Clear previous images
  let uploadedImages = JSON.parse(localStorage.getItem("uploadedImages")) || [];

  uploadedImages.forEach((url) => {
    const img = document.createElement("img");
    img.src = url;
    img.style.width = "150px";
    img.style.margin = "10px";
    img.style.borderRadius = "10px";
    img.style.boxShadow = "0px 4px 6px rgba(0, 0, 0, 0.1)";
    gallery.appendChild(img);
  });
}

// Load images on page load
document.addEventListener("DOMContentLoaded", displayImages);

const BACKEND_URL = "http://localhost:5000/api/get-images"; // Change if deploying

async function fetchImages() {
  try {
    const response = await fetch(BACKEND_URL);
    if (!response.ok) throw new Error("Failed to load images.");

    const data = await response.json();
    displayImages(data);
  } catch (error) {
    console.error("Error fetching images:", error);
    document.getElementById("gallery").innerHTML =
      "<p>Failed to load images.</p>";
  }
}

// Function to Display Images in Gallery
function displayImages(images) {
  if (!images || images.length === 0) {
    document.getElementById("gallery").innerHTML = "<p>No images found.</p>";
    return;
  }
  if (images.length > 0) {
    const gallery = document.getElementById("gallery");
    gallery.innerHTML = ""; // Clear existing images

    images.forEach((image) => {
      const img = document.createElement("img");
      img.src = image.secure_url;
      img.alt = "Uploaded Image";
      img.classList.add("gallery-img");
      gallery.appendChild(img);
    });
  }
}

// Load images on page load
document.addEventListener("DOMContentLoaded", fetchImages);
