// copy key to clipboard
let btns = document.querySelectorAll("#clipboard");
if (btns) {
  btns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      let parent_children = e.target.parentElement.children;
      Array.from(parent_children).forEach((child) => {
        if (child.nodeName.toLowerCase() == "textarea") {
          child.select();
          child.setSelectionRange(0, 99999);
          document.execCommand("copy");
          alert("key copied to clipboard");
        }
      });
    });
  });
}
// copy public or private keys to clipboard (usage: copy_key(publicKeyHolder | privateKeyHolder))
function copy_key(key_holder) {
  if (key_holder != "publicKeyHolder" || key_holder != "privateKeyHolder")
    return;
  var copyText = document.getElementById(key_holder);
  copyText.select();
  copyText.setSelectionRange(0, 99999);
  document.execCommand("copy");
  alert("public key copied to clipboard");
}
// calculate total price when buying coins
let numberOfCoins = document.getElementById("numberOfCoins");
if (numberOfCoins) {
  let price = 50;
  let totalPrice = document.getElementById("totalPrice");
  numberOfCoins.addEventListener("input", () => {
    totalPrice.innerText = price * numberOfCoins.value;
  });
}
// shorten the table cells
let table = document.querySelector("table");
if (table) {
  let cells = document.querySelectorAll("table td");
  cells.forEach((cell, index) => {
    if (cell.innerText.length > 50) {
      // assign data-id for the cell
      cell.setAttribute("data-id", index);
      // add an invisible read-me div with the id of the cell
      let readmore = document.createElement("div");
      readmore.classList.add("read-more");
      readmore.innerHTML = `<button>close</button><p>${cell.innerText}</p>`;
      readmore.setAttribute("data-cell", index);
      document.body.appendChild(readmore);
      // shorten
      cell.innerText = cell.innerText.substr(0, 50) + "...";
      // cursor on hover
      cell.style.cursor = "pointer";
      // listen on clicks to display the relative read-me
      cell.addEventListener("click", () => {
        let readmore = document.querySelector(
          `[data-cell='${cell.getAttribute("data-id")}']`
        );
        readmore.classList.add("show");
      });
    }
  });
}
let closeBtns = document.querySelectorAll(".read-more button");
if (closeBtns) {
  closeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.parentElement.classList.remove("show");
    });
  });
}
// disable mining button after clicking it
let miningBtn = document.getElementById("mining-btn");
if (miningBtn) {
  miningBtn.addEventListener("click", () => {
    miningBtn.style.cursor = "not-allowed";
    miningBtn.disabled = "true";
    miningBtn.innerText = "mining ...";
  });
}
