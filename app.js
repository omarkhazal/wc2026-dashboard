const kickoffDate=new Date("2026-06-11T19:00:00");const finalDate=new Date("2026-07-19T23:59:59");function updateTournamentStatus(){const now=new Date();const countdown=document.getElementById("countdown");const label=document.getElementById("hero-label");const subtitle=document.getElementById("hero-subtitle");if(!countdown)return;if(now<kickoffDate){const diff=kickoffDate-now;const days=Math.floor(diff/(1000*60*60*24));const hours=Math.floor(diff%(1000*60*60*24)/(1000*60*60));if(label)label.innerText="COUNTDOWN TO KICK-OFF";countdown.innerHTML=`${days} ${hours}<span>days / hours</span>`;if(subtitle)subtitle.innerText="11 JUNE 2026";return}if(now>=kickoffDate&&now<=finalDate){if(label)label.innerText="TOURNAMENT STATUS";countdown.innerHTML=`LIVE<span>tournament in progress</span>`;if(subtitle)subtitle.innerText="11 JUNE — 19 JULY 2026";return}if(label)label.innerText="TOURNAMENT COMPLETE";countdown.innerHTML=`FINAL<span>champion crowned</span>`;if(subtitle)subtitle.innerText="SEE YOU IN 2030"}updateTournamentStatus();setInterval(updateTournamentStatus,1000);

function renderTwemoji() {
  if (window.twemoji) {
    twemoji.parse(document.body, {
      folder: "svg",
      ext: ".svg"
    });
  }
}

window.addEventListener("load", renderTwemoji);
setTimeout(renderTwemoji, 300);
