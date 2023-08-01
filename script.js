// Store references to the column containers
const todoColumn = document.getElementById("todo");
const inProgressColumn = document.getElementById("in-progress");
const doneColumn = document.getElementById("done");

// Store references to the current dragged card and its original container
let draggedCard = null;
let originalColumn = null;
let offsetX = 0;
let offsetY = 0;
let ghostCard = null;

// Add mousedown event listeners to each card to initiate dragging
document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("mousedown", startDragging);
});

function startDragging(e) {
  // Store the dragged card's reference and its original container
  draggedCard = e.target;
  originalColumn = e.target.parentNode;

  // Calculate the offset between the cursor and the card's top-left corner
  const rect = draggedCard.getBoundingClientRect();
  offsetX = e.clientX - rect.left;
  offsetY = e.clientY - rect.top;

  // Set the cursor to "grabbing" while dragging
  document.body.style.cursor = "grabbing";

  // Create a ghost card element
  ghostCard = draggedCard.cloneNode(true);
  ghostCard.style.opacity = "0.5";
  ghostCard.style.pointerEvents = "none";
  ghostCard.style.userSelect = "none";
  ghostCard.style.position = "fixed";

  // Set the card's width and height explicitly to maintain the same size
  ghostCard.style.width = `${rect.width}px`;
  ghostCard.style.height = `${rect.height}px`;

  ghostCard.style.top = e.clientY - offsetY + "px";
  ghostCard.style.left = e.clientX - offsetX + "px";
  document.body.appendChild(ghostCard);

  // Add class to the source column
  originalColumn.classList.add("source-column");

  // Add mousemove and mouseup event listeners to handle dragging
  document.addEventListener("mousemove", drag);
  document.addEventListener("mouseup", endDragging);
}

function drag(e) {
  if (!draggedCard) return;

  // Update the position of the ghost card while moving
  ghostCard.style.top = e.clientY - offsetY + "px";
  ghostCard.style.left = e.clientX - offsetX + "px";

  // Calculate the tilt based on the mouse movement
  const tiltX = (e.clientY - offsetY - window.innerHeight / 2) * 0.01;
  const tiltY = (e.clientX - offsetX - window.innerWidth / 2) * -0.01;

  // Apply the tilt to the ghost card using CSS transforms
  ghostCard.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;

  // Check if the ghost card is over any of the columns
  const targetColumn = findColumnUnderMouse(e.clientX, e.clientY);

  // Remove the class from the previous target column if exists
  document.querySelectorAll(".target-column").forEach((column) => {
    column.classList.remove("target-column");
  });

  // Add class to the new target column
  if (targetColumn) {
    targetColumn.classList.add("target-column");
  }
}

function endDragging(e) {
  if (!draggedCard) return;

  // Remove the ghost card from the document
  document.body.removeChild(ghostCard);

  // Revert the cursor back to its default state
  document.body.style.cursor = "auto";

  // Remove the class from the source column
  originalColumn.classList.remove("source-column");

  // Remove the class from the target column if exists
  document.querySelectorAll(".target-column").forEach((column) => {
    column.classList.remove("target-column");
  });

  // Remove the event listeners used for dragging
  document.removeEventListener("mousemove", drag);
  document.removeEventListener("mouseup", endDragging);

  // Check if the dragged card is over any of the columns
  const targetColumn = findColumnUnderMouse(e.clientX, e.clientY);

  // If the card is dropped on a different column, move it to the target column
  if (targetColumn && targetColumn !== originalColumn) {
    targetColumn.appendChild(draggedCard);
  }

  // Reset the references after dropping the card
  draggedCard = null;
  originalColumn = null;
}

function findColumnUnderMouse(x, y) {
  const elements = document.elementsFromPoint(x, y);

  for (const element of elements) {
    if (element.classList.contains("column")) {
      return element;
    }
  }

  return null;
}
