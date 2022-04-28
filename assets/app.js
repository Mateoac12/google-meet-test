const $ = (selector) => document.querySelector(selector);

const $videoPanel = $("#video-panel");
const $localVideo = $("#local-video");
const $form = $("#form");
const $userCount = $("#user-count");
const $buttonJoin = $("#join");

let connected = false;

const addLocalVideo = async () => {
  const localVideo = await Twilio.Video.createLocalVideoTrack();

  $localVideo.appendChild(localVideo.attach());
};

addLocalVideo();

$form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = $("#username").value;
  if (!username) return alert("Please enter a username");

  $buttonJoin.disabled = true;
  $buttonJoin.innerText = "Conectando...";

  try {
    const response = await fetch("/get_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username }),
    });

    const { token } = await response.json();

    room = await Twilio.Video.connect(token);

    room.participants.forEach(participantConnected);
    room.on("participantConnected", participantConnected);
    room.on("participantDisconnected", participantDisconnected);
    connected = true;

    $buttonJoin.disabled = false;
    $buttonJoin.innerText = "Salir de la reunion";
  } catch (e) {
    console.error(e);

    $buttonJoin.disabled = false;
    $buttonJoin.innerText = "Entrar";
  }
});

function participantConnected(participant) {
  const template = `<div id='participant-${participant.id}' class="participant">
    <div class="video"></div>
    <div>${participant.identity}</div>
  </div>`;

  $videoPanel.insertAdjacentHTML("beforeend", template);

  participant.tracks.forEach((localTrackPublication) => {
    const { isSubscribed, track } = localTrackPublication;
    if (isSubscribed) attachTrack(track);
  });

  participant.on("trackSubscribed", attachTrack);
  participant.on("trackUnsubscribed", (track) => track.detach());
}

function attachTrack(track) {
  const $video = $(`.participant:last-child .video`);
  console.log($video);
  $video.appendChild(track.attach());
}

function participantDisconnected(participant) {
  console.log("participant disconnected");
}
