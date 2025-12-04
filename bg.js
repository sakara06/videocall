const colors = ['#00cad8', '#7b66dd', '#6d82d3', '#60b1e5'];
const numSquares = 25;
const maxVisible = 4;
const squares = [];
let usedColors = new Set(); // pitää kirjaa näkyvistä väreistä

function isTooOverlapping(x, y, size, other) {
  const ox = parseFloat(other.el.style.left);
  const oy = parseFloat(other.el.style.top);
  const os = other.size;

  const xOverlap = Math.max(0, Math.min(x + size, ox + os) - Math.max(x, ox));
  const yOverlap = Math.max(0, Math.min(y + size, oy + os) - Math.max(y, oy));
  const overlapArea = xOverlap * yOverlap;
  const ownArea = size * size;

  return overlapArea > ownArea * 0.5; 
}

// apufunktio väriin, joka ei ole käytössä
function getUniqueColor() {
  const available = colors.filter(c => !usedColors.has(c));
  if (available.length === 0) {
    usedColors.clear(); // jos kaikki käytössä, nollataan
    return getUniqueColor();
  }
  const color = available[Math.floor(Math.random() * available.length)];
  usedColors.add(color);
  return color;
}

// luodaan kaikki neliöt
for (let i = 0; i < numSquares; i++) {
  const sq = document.createElement('div');
  sq.className = 'square';
  
  const size = Math.floor(Math.random() * 500) + 30;
  sq.style.width = size + 'px';
  sq.style.height = size + 'px';

  const maxTop = window.innerHeight - size + 20;
  const minTop = -20;
  const top = Math.random() * (maxTop - minTop) + minTop;

  // ekalla latauksella voi syntyä mistä tahansa
  const left = Math.random() * (window.innerWidth - size);

  const color = getUniqueColor();

  sq.style.top = top + 'px';
  sq.style.left = left + 'px';
  sq.style.backgroundColor = color;
  sq.style.opacity = 0;

  document.getElementById('animated-background').appendChild(sq);

  const speed = Math.random() * 1 + 0.05;
  squares.push({el: sq, speed: speed, size: size, color: color});
}

// näkyvät neliöt
function showInitialSquares() {
  const visibleIndices = new Set();
  while (visibleIndices.size < maxVisible) {
    visibleIndices.add(Math.floor(Math.random() * squares.length));
  }
  visibleIndices.forEach(i => squares[i].el.style.opacity = 0.5);
}

// animointi
function animateSquares() {
  squares.forEach(s => {
    if (parseFloat(s.el.style.opacity) > 0) {
      let current = parseFloat(s.el.style.left);
      current += s.speed;

      if (current > window.innerWidth + 20) {
        // poista vanha väri käytöstä
        usedColors.delete(s.color);

        // resetoidaan vain tämä neliö ja tulee vasemmalta
        const size = Math.floor(Math.random() * 500) + 30;
        s.el.style.width = size + 'px';
        s.el.style.height = size + 'px';

        const maxTop = window.innerHeight - size + 20;
        const minTop = -20;
        let top, attempts = 0;
        do {
          top = Math.random() * (maxTop - minTop) + minTop;
          attempts++;
        } while (squares.some(other => other !== s && isTooOverlapping(0, top, size, other)) && attempts < 50);

        s.el.style.top = top + 'px';
        s.el.style.left = -size + 'px';

        s.speed = Math.random() * 1 + 0.05;
        const newColor = getUniqueColor();
        s.el.style.backgroundColor = newColor;
        s.color = newColor;

        s.el.style.opacity = 0.5;
        s.size = size;
      } else {
        s.el.style.left = current + 'px';
      }
    }
  });
  requestAnimationFrame(animateSquares);
}

showInitialSquares();
animateSquares();
