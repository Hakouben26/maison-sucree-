
"use strict";

// ==========================================
// 1. إعدادات الموقع والمنتجات
// ==========================================

const PHONE = "213659920232";

const products = [
    { id: 1, name: "كيك الشوكولاتة", price: 2800, category: "cake" },
    { id: 2, name: "فراولة وكريمة", price: 3200, category: "cake" },
    { id: 3, name: "كيك الفستق", price: 3600, category: "cake" },
    { id: 4, name: "كيك الزفاف", price: null, category: "cake", quoteOnly: true },
    { id: 5, name: "بقلاوة", price: 180, category: "traditional", unit: "للحبة" },
    { id: 6, name: "مقروط اللوز", price: 180, category: "traditional", unit: "للحبة" },
    { id: 7, name: "تشاراك عريان", price: 140, category: "traditional", unit: "للحبة" },
    { id: 8, name: "غريبية", price: 100, category: "traditional", unit: "للحبة" }
];

let cart = [];

const formatPrice = (price) =>
    Number(price).toLocaleString("fr-DZ") + " دج";


// ==========================================
// 2. حفظ واسترجاع السلة تلقائياً
// ==========================================

function saveCart() {
    try {
        localStorage.setItem("maisonSucreeCart", JSON.stringify(cart));
    } catch (error) {
        console.error("Erreur de sauvegarde du panier:", error);
    }
}

function loadCart() {
    try {
        const savedCart = localStorage.getItem("maisonSucreeCart");

        if (!savedCart) return;

        const parsedCart = JSON.parse(savedCart);

        if (!Array.isArray(parsedCart)) return;

        cart = parsedCart
            .filter(item =>
                item &&
                products.some(product => product.id === item.id)
            )
            .map(item => {
                const product = products.find(p => p.id === item.id);
                const quantity = Number(item.quantity);

                return {
                    ...product,
                    quantity:
                        Number.isInteger(quantity) && quantity > 0
                            ? Math.min(quantity, 99)
                            : 1
                };
            });

        saveCart();

    } catch (error) {
        console.error("Erreur de chargement du panier:", error);
        cart = [];
    }
}

loadCart();


// ==========================================
// 3. إنشاء زر السلة
// ==========================================

const header = document.querySelector("header");

const cartButton = document.createElement("button");

cartButton.className = "cart-trigger";
cartButton.type = "button";
cartButton.innerHTML = '🛒 السلة <span id="cart-count">0</span>';

header.appendChild(cartButton);


// ==========================================
// 4. إضافة أزرار المنتجات
// ==========================================

const menuItems = document.querySelectorAll(".item");

menuItems.forEach((item, index) => {
    const product = products[index];

    if (!product) return;

    const button = document.createElement("button");

    button.className = "add-cart";
    button.type = "button";

    button.textContent = product.quoteOnly
        ? "اطلب عرض سعر"
        : "أضف إلى السلة";

    button.addEventListener("click", () => {
        addToCart(product.id);
    });

    item.appendChild(button);
});


// ==========================================
// 5. إنشاء نافذة السلة
// ==========================================

document.body.insertAdjacentHTML("beforeend", `
    <div class="cart-overlay" id="cart-overlay">

        <div class="cart-drawer">

            <div class="cart-header">
                <h2>سلة مشترياتك 🛍️</h2>
                <button id="close-cart" type="button" aria-label="إغلاق">×</button>
            </div>

            <div id="cart-items"></div>

            <div class="cart-footer">

                <div class="cart-total">
                    <span>المجموع:</span>
                    <strong id="cart-total">0 دج</strong>
                </div>

                <small id="cart-note"></small>

                <input
                    id="customer-name"
                    type="text"
                    placeholder="اسمك الكامل"
                    maxlength="80"
                >

                <input
                    id="customer-phone"
                    type="tel"
                    placeholder="رقم هاتفك (05 أو 06 أو 07)"
                    maxlength="14"
                    inputmode="tel"
                >

                <textarea
                    id="customer-notes"
                    placeholder="ملاحظات إضافية (اختياري)"
                    maxlength="500"
                ></textarea>

                <button id="checkout" type="button">
                    تأكيد الطلب عبر واتساب
                </button>

            </div>

        </div>
    </div>
`);

const overlay = document.getElementById("cart-overlay");

cartButton.addEventListener("click", openCart);

document.getElementById("close-cart").addEventListener("click", closeCart);

overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
        closeCart();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeCart();
    }
});

function openCart() {
    overlay.classList.add("active");
    renderCart();
}

function closeCart() {
    overlay.classList.remove("active");
}


// ==========================================
// 6. إضافة منتج إلى السلة
// ==========================================

function addToCart(id) {
    const product = products.find(p => p.id === id);

    if (!product) return;

    const existing = cart.find(p => p.id === id);

    if (existing) {
        if (existing.quantity >= 99) {
            alert("الحد الأقصى للكمية هو 99.");
            return;
        }

        existing.quantity++;

    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    saveCart();
    renderCart();

    cartButton.classList.add("cart-added");

    setTimeout(() => {
        cartButton.classList.remove("cart-added");
    }, 400);

    openCart();
}


// ==========================================
// 7. تغيير الكمية
// ==========================================

function changeQuantity(id, amount) {
    const product = cart.find(p => p.id === id);

    if (!product) return;

    if (amount > 0 && product.quantity >= 99) {
        alert("الحد الأقصى للكمية هو 99.");
        return;
    }

    product.quantity += amount;

    if (product.quantity <= 0) {
        cart = cart.filter(p => p.id !== id);
    }

    saveCart();
    renderCart();
}


// ==========================================
// 8. حذف منتج
// ==========================================

function removeFromCart(id) {
    cart = cart.filter(p => p.id !== id);

    saveCart();
    renderCart();
}


// ==========================================
// 9. حساب المجموع
// ==========================================

function calculateTotal() {
    return cart.reduce((sum, product) => {
        if (product.quoteOnly) return sum;

        return sum + product.price * product.quantity;
    }, 0);
}

function hasQuoteProduct() {
    return cart.some(product => product.quoteOnly);
}


// ==========================================
// 10. عرض محتويات السلة
// ==========================================

function renderCart() {
    const container = document.getElementById("cart-items");
    const countElement = document.getElementById("cart-count");
    const totalElement = document.getElementById("cart-total");
    const noteElement = document.getElementById("cart-note");

    const count = cart.reduce(
        (sum, product) => sum + product.quantity,
        0
    );

    const total = calculateTotal();

    countElement.textContent = count;
    totalElement.textContent = formatPrice(total);

    if (hasQuoteProduct()) {
        totalElement.textContent += " + سعر كيك الزفاف يحدد بعد التأكيد";

        noteElement.textContent =
            "سعر كيك الزفاف يُحدد حسب الحجم والتصميم والعدد.";
    } else {
        noteElement.textContent = "";
    }

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <div>🛒</div>
                <p>سلتك فارغة حالياً</p>
                <small>أضف بعض الحلويات اللذيذة!</small>
            </div>
        `;

        totalElement.textContent = "0 دج";
        noteElement.textContent = "";

        return;
    }

    container.innerHTML = cart.map(product => {
        const priceText = product.quoteOnly
            ? "السعر يحدد بعد التأكيد"
            : `${formatPrice(product.price)} ${product.unit ? "/ " + product.unit : ""}`;

        const subtotalText = product.quoteOnly
            ? "يحتاج عرض سعر"
            : formatPrice(product.price * product.quantity);

        return `
            <div class="cart-product">

                <div class="cart-product-info">

                    <strong>${product.name}</strong>

                    <span>${priceText}</span>

                    <span>المجموع: ${subtotalText}</span>

                </div>

                <div class="quantity-controls">

                    <button
                        type="button"
                        data-action="minus"
                        data-id="${product.id}"
                        aria-label="تقليل الكمية"
                    >−</button>

                    <span>${product.quantity}</span>

                    <button
                        type="button"
                        data-action="plus"
                        data-id="${product.id}"
                        aria-label="زيادة الكمية"
                    >+</button>

                    <button
                        type="button"
                        class="remove-product"
                        data-action="remove"
                        data-id="${product.id}"
                    >حذف</button>

                </div>

            </div>
        `;
    }).join("");

    container.querySelectorAll("[data-action]").forEach(button => {
        button.addEventListener("click", () => {
            const id = Number(button.dataset.id);
            const action = button.dataset.action;

            if (action === "plus") {
                changeQuantity(id, 1);
            }

            if (action === "minus") {
                changeQuantity(id, -1);
            }

            if (action === "remove") {
                removeFromCart(id);
            }
        });
    });
}


// ==========================================
// 11. إرسال الطلب إلى واتساب
// ==========================================

document.getElementById("checkout").addEventListener("click", () => {

    if (cart.length === 0) {
        alert("السلة فارغة! أضف منتجات أولاً.");
        return;
    }

    const nameInput = document.getElementById("customer-name");
    const phoneInput = document.getElementById("customer-phone");
    const notesInput = document.getElementById("customer-notes");

    const name = nameInput.value.trim();
    const customerPhone = phoneInput.value.replace(/\s+/g, "");
    const notes = notesInput.value.trim();

    if (!name) {
        alert("من فضلك أدخل اسمك الكامل.");
        nameInput.focus();
        return;
    }

    if (!/^0[567]\d{8}$/.test(customerPhone)) {
        alert("من فضلك أدخل رقم هاتف جزائري صحيحاً.");
        phoneInput.focus();
        return;
    }

    if (!/^213[567]\d{8}$/.test(PHONE)) {
        alert("يرجى التأكد من رقم واتساب المحل.");
        return;
    }

    const total = calculateTotal();

    let message = `السلام عليكم 👋
أريد تأكيد طلبي من عسل وكريمة 🍰

👤 الاسم: ${name}
📞 رقم الهاتف: ${customerPhone}

🛍️ تفاصيل الطلب:
`;

    cart.forEach((product, index) => {
        message += `\n${index + 1}. ${product.name}\n`;
        message += `الكمية: ${product.quantity}\n`;

        if (product.quoteOnly) {
            message += "السعر: يُحدد بعد الاتفاق\n";
        } else {
            message += `سعر الوحدة: ${formatPrice(product.price)}\n`;
            message += `المجموع: ${formatPrice(product.price * product.quantity)}\n`;
        }
    });

    message += `\n💰 المجموع التقريبي: ${formatPrice(total)}`;

    if (hasQuoteProduct()) {
        message += `
ملاحظة: يوجد كيك زفاف يحتاج إلى عرض سعر حسب التصميم والحجم.`;
    }

    if (notes) {
        message += `\n\n📝 ملاحظات إضافية:\n${notes}`;
    }

    message += `

شكراً لكم ❤️`;

    const encodedMessage = encodeURIComponent(
        message.normalize("NFC")
    );

    const url = `https://api.whatsapp.com/send?phone=${PHONE}&text=${encodedMessage}`;

    window.open(url, "_blank");
});


// ==========================================
// 12. اقتراح الكيك
// ==========================================

const P = {
    bd: {
        t: "كيك الشوكولاتة",
        p: 300
    },

    wd: {
        t: "كيك الزفاف بثلاث طبقات",
        p: 600
    },

    eid: {
        t: "بقلاوة ومقروط اللوز",
        p: 250
    },

    gift: {
        t: "علبة بقلاوة وغريبية",
        p: 400
    }
};

function upd() {
    const occasion = document.getElementById("occ").value;
    const inputNumber = document.getElementById("n");

    let people = parseInt(inputNumber.value, 10) || 2;

    people = Math.max(2, Math.min(300, people));

    inputNumber.value = people;

    const option = P[occasion];

    if (!option) return;

    const total = Math.round(people * option.p / 100) * 100;

    document.getElementById("res").innerHTML = `
        نقترح عليك <strong>${option.t}</strong>
        لـ ${people} أشخاص،
        بسعر تقريبي <strong>${formatPrice(total)}</strong>.
    `;

    const message =
        `السلام عليكم، أريد طلب: ${option.t} لـ ${people} أشخاص.`;

    document.getElementById("wa").href =
        `https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`;
}

document.getElementById("occ").addEventListener("change", upd);
document.getElementById("n").addEventListener("input", upd);

upd();


// ==========================================
// 13. Chatbot Groq
// ==========================================

let hist = [];
let busy = false;

function addMsg(text, className) {
    const div = document.createElement("div");

    div.className = "m " + className;
    div.textContent = text;

    const messages = document.getElementById("msgs");

    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;

    return div;
}

async function sendMsg() {
    const input = document.getElementById("ci");
    const question = input.value.trim();

    if (!question || busy) return;

    input.value = "";
    busy = true;

    document.getElementById("cs").disabled = true;

    addMsg(question, "u");

    hist.push({
        role: "user",
        content: question
    });

    const bubble = addMsg("...", "b");

    try {
        const response = await fetch("/chat", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                messages: hist.slice(-10)
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Chat error");
        }

        bubble.textContent = data.reply;

        hist.push({
            role: "assistant",
            content: data.reply
        });

    } catch (error) {
        bubble.textContent =
            "تعذّر الرد الآن. راسلنا عبر واتساب.";

        hist.pop();

        console.error(error);

    } finally {
        busy = false;

        document.getElementById("cs").disabled = false;

        input.focus();
    }
}


// ==========================================
// 14. فتح وإغلاق Chatbot
// ==========================================

(function () {
    const fab = document.getElementById("fab");
    const chatBox = document.getElementById("chat");

    fab.style.display = "block";

    addMsg(
        "مرحباً بك في عسل وكريمة 🍰 اسألني عن الأسعار أو التشكيلة أو أوقات العمل.",
        "b"
    );

    fab.addEventListener("click", function () {
        chatBox.classList.add("open");

        fab.style.display = "none";

        document.getElementById("ci").focus();
    });

    document.getElementById("cx").addEventListener("click", function () {
        chatBox.classList.remove("open");

        fab.style.display = "block";
    });

    document.getElementById("cs").addEventListener("click", sendMsg);

    document.getElementById("ci").addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            sendMsg();
        }
    });
})();


// ==========================================
// 15. عرض السلة المحفوظة عند فتح الموقع
// ==========================================

renderCart();
