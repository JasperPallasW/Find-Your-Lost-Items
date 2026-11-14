// heroes.js - the Finder Heroes page: the ranking list under the 3D chart,
// the full ranking table, and the thank-you wall.
// (The 3D chart itself is drawn by chart3d.js.)

const allItems = getItems();
const board = buildFinderBoard(allItems);

// 1) Ranking list under the 3D chart: rank, name and points.
//    The colored dot has the same color as the bar of that finder.
const chartRanking = document.getElementById("chartRanking");
chartRanking.innerHTML = "";
for (let i = 0; i < board.length; i++) {
  let dot = "dot-n";           // blue
  if (i < 3) {
    dot = "dot-" + (i + 1);    // gold, silver, bronze
  }
  chartRanking.innerHTML += `
    <li class="chart-rank-item">
      <span class="rank-dot ${dot}"></span>
      <span class="rank-pos">${i + 1}.</span>
      <strong>${escapeHtml(board[i].name)}</strong>
      <span class="text-muted">${board[i].points} points</span>
    </li>`;
}
if (board.length === 0) {
  chartRanking.innerHTML = '<li class="text-muted">No heroes yet. Return a found item to be the first!</li>';
}

// 2) Full ranking table (with origin, number of returns and badge)
const heroesBody = document.getElementById("heroesBody");
heroesBody.innerHTML = "";
for (let i = 0; i < board.length; i++) {
  const finder = board[i];
  heroesBody.innerHTML += `
    <tr>
      <td>${i + 1}</td>
      <td><strong>${escapeHtml(finder.name)}</strong></td>
      <td>${escapeHtml(finder.origin)}</td>
      <td>${finder.returns}</td>
      <td>${finder.points}</td>
      <td>${badgeHtml(finder.badge)}</td>
    </tr>`;
}

// 3) Thank-you wall: feedback written by owners who confirmed a return (newest first)
const notes = [];
for (let i = 0; i < allItems.length; i++) {
  const item = allItems[i];
  if (item.status === "returned" && item.responderId && item.returnedNote) {
    notes.push(item);
  }
}
notes.sort(function (a, b) {
  return a.returnedDate < b.returnedDate ? 1 : -1;
});

const wall = document.getElementById("thanksWall");
wall.innerHTML = "";
for (let i = 0; i < notes.length && i < 6; i++) {
  const item = notes[i];
  const owner = getOwner(item);
  const finder = getFinder(item);
  wall.innerHTML += `
    <div class="col-md-6 col-lg-4 fade-up">
      <div class="card thanks-card h-100">
        <div class="card-body">
          <p class="thanks-quote">&ldquo;${escapeHtml(item.returnedNote)}&rdquo;</p>
          <p class="small mb-0">
            <strong>${escapeHtml(owner.name)}</strong> thanks
            <strong>${escapeHtml(finder.name)}</strong> for returning
            <a href="detail.html?id=${item.id}">${escapeHtml(item.name)}</a>
            <span class="text-muted">(${formatDate(item.returnedDate)})</span>
          </p>
        </div>
      </div>
    </div>`;
}
