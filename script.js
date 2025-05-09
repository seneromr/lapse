// Örnek veri bağlantısı (değiştirilebilir)
const DATA_URL = 'https://raw.githubusercontent.com/ozgurozturknet/json-data/main/cards.json';

let cards = [];
let currentIndex = 0;

const cardStack = document.getElementById('card-stack');
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modal-body');
const closeModal = document.getElementById('close-modal');

// Kartları harici bağlantıdan çek
fetch(DATA_URL)
    .then(res => res.json())
    .then(data => {
        cards = data;
        renderCards();
    })
    .catch(() => {
        // Hata durumunda örnek veri göster
        cards = [
            {
                title: 'Kedi',
                content: 'Sevimli bir kedi fotoğrafı.',
                detail: 'Kediler evcil ve oyuncu hayvanlardır.',
                image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=300&q=80'
            },
            {
                title: 'Köpek',
                content: 'Sadık bir köpek fotoğrafı.',
                detail: 'Köpekler sadık ve koruyucu hayvanlardır.',
                image: 'https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=300&q=80'
            },
            {
                title: 'Dağ',
                content: 'Doğal bir dağ manzarası.',
                detail: 'Dağlar doğanın en etkileyici yapılarındandır.',
                image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=300&q=80'
            },
            {
                title: 'Deniz',
                content: 'Mavi deniz ve gökyüzü.',
                detail: 'Denizler huzur ve ferahlık verir.',
                image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=300&q=80'
            },
            {
                title: 'Kitap',
                content: 'Açık bir kitap fotoğrafı.',
                detail: 'Kitaplar bilgi ve hayal gücü kaynağıdır.',
                image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=300&q=80'
            }
        ];
        renderCards();
    });

function renderCards() {
    cardStack.innerHTML = '';
    // Sadece en üstteki kartı ve bir altındaki kartı DOM'a ekle
    for (let i = cards.length - 1; i >= currentIndex; i--) {
        if (i < currentIndex + 2) { // Sadece en üstteki ve bir altındaki kart
            const card = document.createElement('div');
            card.className = 'card';
            card.style.zIndex = i - currentIndex + 1;
            let imgHtml = cards[i].image ? `<img src="${cards[i].image}" alt="">` : '';
            card.innerHTML = `
                ${imgHtml}
            `;
            card.addEventListener('mousedown', startDrag);
            card.addEventListener('touchstart', startDrag);
            cardStack.appendChild(card);
        }
    }
}

// Modal açma
function showModal(card) {
    modalBody.innerHTML = `<h2>${card.title}</h2><p>${card.detail || card.content}</p>`;
    modal.style.display = 'block';
}
closeModal.onclick = () => {
    modal.style.display = 'none';
};
window.onclick = (e) => {
    if (e.target === modal) modal.style.display = 'none';
};

// Swipe (kaydırma) fonksiyonu
let startX = 0, currentCard = null, isDragging = false, autoSwiped = false;
function startDrag(e) {
    if (currentIndex >= cards.length) return;
    currentCard = e.currentTarget;
    currentCard.classList.add('active', 'dragging');
    startX = e.touches ? e.touches[0].clientX : e.clientX;
    isDragging = true;
    autoSwiped = false;
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('touchmove', onDrag);
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);
}
function onDrag(e) {
    if (!isDragging || !currentCard || autoSwiped) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const dx = x - startX;
    // Çok daha belirgin kavis ve dönüş için katsayıları artır
    const dy = Math.sin(dx / 100) * 220; // Çok daha büyük kavis
    const rotate = dx / 3; // Çok daha fazla dönme
    currentCard.style.transform = `translate(${dx}px, ${dy}px) rotate(${rotate}deg)`;
    let opacity = 1 - Math.min(Math.abs(dx) / 400, 0.6);
    currentCard.style.opacity = opacity;
    const SWIPE_THRESHOLD = 150;
    if (dx < -SWIPE_THRESHOLD) {
        autoSwiped = true;
        currentCard.style.transition = 'transform 1.2s, opacity 1.2s';
        currentCard.style.transform = `translate(-120vw, -180px) rotate(-90deg)`;
        currentCard.style.opacity = 0;
        setTimeout(() => {
            if (currentIndex === 0) {
                cards.splice(0, 1);
                renderCards();
            } else {
                currentIndex++;
                renderCards();
            }
            resetDrag();
        }, 1200);
    } else if (dx > SWIPE_THRESHOLD) {
        autoSwiped = true;
        currentCard.style.transition = 'transform 1.2s, opacity 1.2s';
        currentCard.style.transform = `translate(120vw, -180px) rotate(90deg)`;
        currentCard.style.opacity = 0;
        setTimeout(() => {
            showModal(cards[currentIndex]);
            if (currentIndex === 0) {
                cards.splice(0, 1);
            } else {
                currentIndex++;
            }
            renderCards();
            resetDrag();
        }, 1200);
    }
}
function endDrag(e) {
    if (!isDragging || !currentCard || autoSwiped) {
        resetDrag();
        return;
    }
    const x = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const dx = x - startX;
    // Eşik geçilmediyse eski yerine çok belirgin kavisli ve dönerek dön
    const dy = Math.sin(dx / 100) * 220;
    const rotate = dx / 3;
    currentCard.style.transition = 'transform 0.9s, opacity 0.9s';
    currentCard.style.transform = 'translate(0, 0) rotate(0deg)';
    currentCard.style.opacity = 1;
    setTimeout(resetDrag, 900);
}
function resetDrag() {
    if (currentCard) currentCard.classList.remove('active', 'dragging');
    if (currentCard) currentCard.style.transition = '';
    currentCard = null;
    isDragging = false;
    autoSwiped = false;
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('touchmove', onDrag);
    document.removeEventListener('mouseup', endDrag);
    document.removeEventListener('touchend', endDrag);
} 