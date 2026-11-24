let producten = [];
let favorieten = (localStorage.getItem("favorieten") || "").split(",").filter(Boolean).map(Number);
let favorietenWeergave = false;

const container = document.querySelector("#producten");
const melding = document.querySelector("#melding");
const zoekveld = document.querySelector("#zoekveld");
const categorie = document.querySelector("#categorie");
const sorteren = document.querySelector("#sorteren");
const titel = document.querySelector("#titel");

async function haalProductenOp() {
  try {
    const antwoord = await fetch("https://dummyjson.com/products?limit=0");
    const data = await antwoord.json();
    producten = data.products;
    console.log("Aantal producten:", producten.length);
    toonProducten(producten);
  } catch (fout) {
    melding.textContent = "Er ging iets mis. Probeer het later opnieuw.";
    melding.className = "melding fout";
  }
}

async function haalCategorieenOp() {
  const antwoord = await fetch("https://dummyjson.com/products/categories");
  const lijst = await antwoord.json();
  lijst.forEach((item) => {
    categorie.innerHTML += `<option value="${item.slug}">${item.name}</option>`;
  });
}

function toonProducten(lijst) {
  container.innerHTML = "";
  lijst.forEach((product) => {
    const actief = favorieten.includes(product.id) ? "actief" : "";
    const prijs = `€ ${product.price.toFixed(2).replace(".", ",")}`;
    container.innerHTML += `
      <article class="kaart" data-id="${product.id}">
        <img class="kaart-foto" src="${product.thumbnail}" alt="${product.title}">
        <button class="hartje ${actief}" data-id="${product.id}">&#9829;</button>
        <section class="kaart-info">
          <span class="kaart-categorie">${product.category}</span>
          <h3 class="kaart-titel">${product.title}</h3>
          <p class="kaart-prijs">${prijs}</p>
        </section>
      </article>`;
  });
  melding.className = lijst.length ? "melding verborgen" : "melding";
  melding.textContent = lijst.length ? "" : "Geen producten gevonden";
  document.querySelector("#favorieten-aantal").textContent = favorieten.length;
}

function filterProducten() {
  let lijst = [...producten];
  const zoekterm = zoekveld.value.toLowerCase();
  if (favorietenWeergave) lijst = lijst.filter((p) => favorieten.includes(p.id));
  if (zoekterm) lijst = lijst.filter((p) => p.title.toLowerCase().includes(zoekterm));
  if (categorie.value !== "alle") lijst = lijst.filter((p) => p.category === categorie.value);
  if (sorteren.value === "laag-hoog") lijst.sort((a, b) => a.price - b.price);
  if (sorteren.value === "hoog-laag") lijst.sort((a, b) => b.price - a.price);
  toonProducten(lijst);
}

function toggleFavoriet(id) {
  favorieten = favorieten.includes(id)
    ? favorieten.filter((item) => item !== id)
    : [...favorieten, id];
  localStorage.setItem("favorieten", favorieten.join(","));
  filterProducten();
}

zoekveld.addEventListener("input", filterProducten);
categorie.addEventListener("change", filterProducten);
sorteren.addEventListener("change", filterProducten);
container.addEventListener("click", (event) => {
  const hartje = event.target.closest(".hartje");
  if (hartje) toggleFavoriet(Number(hartje.dataset.id));
});
document.querySelector("#favorieten-knop").addEventListener("click", () => {
  favorietenWeergave = true;
  titel.textContent = "Mijn favorieten";
  filterProducten();
});
document.querySelector("#alle-producten-knop").addEventListener("click", () => {
  favorietenWeergave = false;
  titel.textContent = "Alle producten";
  filterProducten();
});

haalCategorieenOp();
haalProductenOp();