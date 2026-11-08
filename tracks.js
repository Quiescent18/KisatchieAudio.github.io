const heirarchy = {
  "creditsBroad": {
    "Mixing & Mastering": ["Mixing", "Mastering"],
    "Production": ["Production", "Recording"]
  },
  "genresBroad": {
    "Rock": ["Rock", "Emo", "Post Grunge", "Shoegaze", "Pop Punk", "Pop Rock", "Alternative", "Indie"],
    "Metal": ["Metal"],
    "Instrumental": ["Instrumental"]
  }
};

const tracks = [
  {
    "title": "Bright Fires - Daybreak",
    "file": "audio/bright fires - daybreak final mp3.mp3",
    "artwork": "img/portfolio/bf daybreak cover.JPG",
    "creditsBroad": ["Mixing & Mastering", "Production"],
    "genresBroad": ["Rock"],
    "credits": ["Mixing", "Mastering", "Production", "Recording"],
    "genres": ["Rock", "Emo"]
  },
  {
    "title": "Ashford - Perennial",
    "file": "audio/ashford - perennial.mp3",
    "artwork": "img/portfolio/ashford perennial.jpg",
    "creditsBroad": ["Mixing & Mastering"],
    "genresBroad": ["Rock"],
    "credits": ["Mixing", "Mastering"],
    "genres": ["Post Grunge", "Shoegaze"]
  },
  {
    "title": "Bright Fires - Entropy",
    "file": "audio/bright fires - entropy  FINAL EDIT3.mp3",
    "artwork": "img/portfolio/entropy cover.png",
    "creditsBroad": ["Mixing & Mastering", "Production"],
    "genresBroad": ["Rock"],
    "credits": ["Mixing", "Mastering", "Production", "Recording"],
    "genres": ["Rock", "Emo"]
  },
  {
    "title": "Bright Fires - Paragraphs & Parallels",
    "file": "audio/BRIGHT FIRES - PARAGRAPHS & PARALLELS FINAL (MP3).mp3",
    "artwork": "img/portfolio/Para cover.jpeg",
    "creditsBroad": ["Mixing & Mastering", "Production"],
    "genresBroad": ["Rock"],
    "credits": ["Mixing", "Mastering", "Production", "Recording"],
    "genres": ["Rock", "Emo"]
  },
  {
    "title": "Bright Fires - A Way With Words",
    "file": "audio/bright fires - a way with words M10.mp3",
    "artwork": "img/portfolio/a way.jpg",
    "creditsBroad": ["Mixing & Mastering", "Production"],
    "genresBroad": ["Rock"],
    "credits": ["Mixing", "Mastering", "Production", "Recording"],
    "genres": ["Rock", "Emo"]
  },
  {
    "title": "Bright Fires - Shadows",
    "file": "audio/bright fires - shadows final 7.mp3",
    "artwork": "img/portfolio/bright fires - shadows cover.jpeg",
    "creditsBroad": ["Mixing & Mastering", "Production"],
    "genresBroad": ["Rock"],
    "credits": ["Mixing", "Mastering", "Production", "Recording"],
    "genres": ["Rock", "Emo"]
  },
  {
    "title": "If I'm Lucky - Deja Vu",
    "file": "audio/if im lucky - deja vu.mp3",
    "artwork": "img/portfolio/dejavu.png",
    "creditsBroad": ["Mixing & Mastering"],
    "genresBroad": ["Rock"],
    "credits": ["Mixing", "Mastering"],
    "genres": ["Pop Punk"]
  },
  {
    "title": "Cardinals Pride - What Moves Us",
    "file": "audio/cardinals pride - what moves us.mp3",
    "artwork": "img/portfolio/cardinals.png",
    "creditsBroad": ["Mixing & Mastering"],
    "genresBroad": ["Metal"],
    "credits": ["Mixing", "Mastering"],
    "genres": ["Metal"]
  },
  {
    "title": "Ash Gale - We Got the Fire",
    "file": "audio/ASH GALE- WE GOT THE FIRE.mp3",
    "artwork": "img/portfolio/ash g.png",
    "creditsBroad": ["Mixing & Mastering"],
    "genresBroad": ["Rock"],
    "credits": ["Mixing", "Mastering"],
    "genres": ["Pop Rock"]
  },
  {
    "title": "Voila ft The Ready Set - We Could Be The Future",
    "file": "audio/voila ft the ready set - we could be the future.mp3",
    "artwork": "img/portfolio/voila.png",
    "creditsBroad": ["Mixing & Mastering"],
    "genresBroad": ["Rock"],
    "credits": ["Mixing", "Mastering"],
    "genres": ["Rock"]
  },
  {
    "title": "Trees On Mars - First Place",
    "file": "audio/trees on mars- first place.mp3",
    "artwork": "img/portfolio/trees.png",
    "creditsBroad": ["Mixing & Mastering"],
    "genresBroad": ["Rock", "Instrumental"],
    "credits": ["Mixing", "Mastering"],
    "genres": ["Rock", "Instrumental"]
  },
  {
    "title": "Drew Elliott - Conversations",
    "file": "audio/drew elliott - conversations.mp3",
    "artwork": "img/portfolio/drew.png",
    "creditsBroad": ["Mixing & Mastering"],
    "genresBroad": ["Rock"],
    "credits": ["Mixing", "Mastering"],
    "genres": ["Alternative", "Indie", "Pop Rock"]
  },
  {
    "title": "Lilyhammer - For You",
    "file": "audio/lilyhammer - for you (master).mp3",
    "artwork": "img/portfolio/lily.jpg",
    "creditsBroad": ["Mixing & Mastering"],
    "genresBroad": ["Rock"],
    "credits": ["Mastering"],
    "genres": ["Rock"]
  },
  {
    "title": "Signifier - Single",
    "file": "audio/SIGNIFIER - SINGLE.mp3",
    "artwork": "img/portfolio/signifier.png",
    "creditsBroad": ["Mixing & Mastering"],
    "genresBroad": ["Metal"],
    "credits": ["Mixing", "Mastering"],
    "genres": ["Metal"]
  },
  {
    "title": "Burst and Bloom - Liar",
    "file": "audio/burst and bloom - liar.mp3",
    "artwork": "img/portfolio/liar.png",
    "creditsBroad": ["Mixing & Mastering"],
    "genresBroad": ["Rock"],
    "credits": ["Mixing", "Mastering"],
    "genres": ["Rock"]
  },
  {
    "title": "Demo Division - Control",
    "file": "audio/demo division - control.mp3",
    "artwork": "img/portfolio/demo dev.png",
    "creditsBroad": ["Mixing & Mastering"],
    "genresBroad": ["Rock"],
    "credits": ["Mixing", "Mastering"],
    "genres": ["Rock"]
  },
  {
    "title": "Crossley Hunter - Dilatory",
    "file": "audio/crossley hunter - dialatory 2022 mix.mp3",
    "artwork": "img/portfolio/dilatory.png",
    "creditsBroad": ["Mixing & Mastering"],
    "genresBroad": ["Rock"],
    "credits": ["Mixing", "Mastering"],
    "genres": ["Rock"]
  },
  {
    "title": "The Bright Star Alliance - Error 404",
    "file": "audio/the bright star alliance - error 404.mp3",
    "artwork": "img/portfolio/bright star.png",
    "creditsBroad": ["Mixing & Mastering"],
    "genresBroad": ["Metal"],
    "credits": ["Mixing", "Mastering"],
    "genres": ["Metal"]
  },
  {
    "title": "The Western Den - Like You Do (live)",
    "file": "audio/the western den - like you do.mp3",
    "artwork": "img/portfolio/western.png",
    "creditsBroad": ["Mixing & Mastering"],
    "genresBroad": ["Rock"],
    "credits": ["Mixing", "Mastering"],
    "genres": ["Indie"]
  }
];
