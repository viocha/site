class Note{
  constructor(value){
    if (value.constructor===String){
      this.name = Note.normalizeName(value);
      this.order = Note.nameToOrder(value);
    } else if (value.constructor===Number){
      this.order = value;
      this.name = Note.orderToName(value);
    }
  }

  static nameToOrder(pitchName){
    const map = {
      'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11,
    };
    pitchName = Note.normalizeName(pitchName);

    let order = map[pitchName[0]];
    if (pitchName.includes('b')){
      order -= 1;
    } else if (pitchName.includes('#')){
      order += 1;
    }
    order += pitchName.at(-1)*12;

    return order;
  }

  static orderToName(order){
    const map = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

    const remainder = order%12;
    let name = map[remainder];
    name += (order-remainder)/12;

    return name;
  }

  static normalizeName(name){
    return name[0].toUpperCase()+name.slice(1);
  }

  toString(){
    return this.name;
  }

  diff(other){
    return this.order-other.order;
  }

  add(n){
    return new Note(this.order+n);
  }
}

// 加载音色
window.piano = SampleLibrary.load({
                                    instruments: 'piano',
                                  }).toDestination();

const APP = {
  data(){
    const DATA = {
      duration: 1, // 没有效果现在, 因为使用releaseAll()取消
      interval: 0.27,
      defaultInterval: 0.27,
      selectedSong: 0,
      key: 'C3',
      defaultKey: 'C3',
      isCustom: false,
      customSong: '',
    };

    const songs = [
      '1 2 3 4 5 4 3 2 1',

      ['1 2 3 4 5 - - - 4 3 2 1', 0.25],

      ['1 2 3 4 5 4 3 2 1 2 3 4 5 4 3 2 1', 0.25],

      '1 2 3 2 1',

      '1 2 3--- 2 1',

      '1 3 5 3 1',

      '1 3 5--- 3 1',

      ['5 4 3 2 1', null, 'C4'],

      ['5 3 1 5 3 1', null, 'C4'],

      ['1 3 5 1. 5 3 1', 0.25],

      ['1 3 5 1. 1. 1. 1. 5 3 1', 0.25],

      ['1 3 5 1.--- 5 3 1', 0.25],

      ['1 3 5 1. 5 3 1 3 5 1. 5 3 1', 0.25],

      ['1. 1. 1. 1. 5 3 1', 0.25, 'C4'],

      ['1. 5 3 1 1. 5 3 1', 0.25, 'C4'],

      ['1 3 5 1. 3. 5. 4. 2. 7 5 4 2 1', 0.25, 'G3'],

      ['1- 3 5-  1.- 3. 5.-   4.- 2. 7-   5- 4 2-   1', 0.18, 'G3'],

      ['1--- 3-- 5---  1.--- 3.-- 5.---   4.--- 2.-- 7---   5--- 4-- 2---   1--', 0.08, 'G3'],

      ['1--- 3-- 5---  1.--- 3.-- 5.--- ---- ----   4.--- 2.-- 7---   5--- 4-- 2---   1--', 0.07, 'G3'],

      ['1 3 5 1. 3. 5. 4. 2. 3. 5. 4. 2. 7 5 4 2 1', 0.25,'G3'],

      ['1 3 5 1. 3. 5. 4. 2. 7 5 4 2 1 3 5 1. 3. 5. 4. 2. 7 5 4 2 1', 0.24,'G3'],

    ];

    const keyList = [];
    for (let note = new Note('F2'); note.toString()!=='G#4'; note = note.add(1)){
      keyList.push(note.toString());
    }

    const pitchList = [];
    for (let note = new Note('C2'); note.toString()!=='C6'; note = note.add(1)){
      pitchList.push(note.toString());
    }

    Object.assign(DATA, {songs, keyList, pitchList});
    return DATA;
  }, methods: {
    onUp(){
      this.key = new Note(this.key).add(1).toString();
      this.playKeyNote();
    },

    onDown(){
      this.key = new Note(this.key).add(-1).toString();
      this.playKeyNote();
    },

    playLow(e){
      if (e?.repeat){
        return;
      }
      this.playPitch(this.getRange().split(' - ')[0]);
    },

    playHigh(e){
      if (e?.repeat){
        return;
      }
      this.playPitch(this.getRange().split(' - ')[1]);
    },

    playKeyNote(e){
      if (e?.repeat){
        return;
      }

      this.playPitch(this.key);
    },

    playPitch(name, event){
      if (event?.repeat){
        return;
      }

      const now = Tone.now()-0.1; // 会有延迟
      this.stopPlaying();
      piano.triggerAttack(name, now);
    },

    stopPlaying(){
      piano.releaseAll();
    },

    play(e){
      if (e?.repeat){
        return;
      }

      const song = this.getSelectedSong()[0];

      const notes = song.replaceAll(/(?<!\s)-/g, ' -').split(/\s+/).map(toName);
      const key = Note.normalizeName(this.key);

      const now = Tone.now()-0.1;

      let note = new Note(key);
      let startTime = now;
      let lastNote = new Note(notes[0]);

      this.stopPlaying(); // 释放上次的播放
      notes.forEach((v, i) => {
        if (i===0){
          // piano.triggerAttackRelease(note.toString(), this.duration, startTime);
          piano.triggerAttack(note.toString(), startTime);
          return;
        }

        startTime += this.interval;
        if (v==='-'){
          return;
        }

        const newNote = new Note(v);
        const n = newNote.diff(lastNote);
        lastNote = newNote;

        note = note.add(n);
        // piano.triggerAttackRelease(note.toString(), this.duration, startTime);
        piano.triggerAttack(note.toString(), startTime);
      });

    },

    // 返回用于显示的练声曲
    getDisplaySong(i){
      let song = this.songs[i];
      if (Array.isArray(song)){
        song = song[0];
      }
      return song.replaceAll(/(?<!\s)-/g, ' -').split(/\s+/).map(normalize).join(' ').replaceAll(' -', '-');

      // 替换点号的显示
      function normalize(s){
        let n = s.match(/\d/)?.[0];
        if (!n){
          return '-';
        }

        const upperDots = s.match(/\d(\.*)/)[1].length;
        const lowerDots = s.match(/(\.*)\d/)[1].length;

        for (let i = 0; i<upperDots; i++){
          // n = `\\dot{${n}}`;
          n += '\u0307';
        }
        for (let i = 0; i<lowerDots; i++){
          // n = '\\cdot'+n;
          n += '\u0323';
        }

        // return `$${n}$`;
        return n;
      }
    },

    //曲子的音高范围
    getRange(){
      const key = Note.normalizeName(this.key);
      const keyNote = new Note(key);

      const song = this.getSelectedSong()[0];
      let notes = song.split(/\s+/)
                      .map(toName)
                      .filter(x => x!=='-')
                      .map(x => new Note(x));

      const firstNote = notes[0];
      notes = notes.map(x => keyNote.add(x.diff(firstNote)))
                   .sort((a, b) => a.order-b.order);

      if (notes.length){
        return notes[0]+' - '+notes.at(-1);
      }
      return '';
    },

    onSongChange(){
      this.interval = this.getSelectedSong()[1];
      this.key = this.getSelectedSong()[2];
    },

    // 返回[song,interval,key]
    getSelectedSong(){
      let song = this.isCustom? this.customSong : this.songs[this.selectedSong];
      let interval, key;
      if (Array.isArray(song)){
        interval = song[1] || this.defaultInterval;
        key = song[2] || this.defaultKey;
        song = song[0];
      } else {
        interval = this.defaultInterval;
        key = this.defaultKey;
      }

      return [song, interval, key];
    },
  },

  mounted(){
    const songList = document.forms[0]['selectedSong'];

    // 全局快捷键
    document.onkeydown = e => {

      // 更改key
      if (e.altKey){
        const name = e.code.at(-1);
        if (['G', 'A', 'B'].includes(name)){
          document.getElementById(name+'2').click();
        } else if (['C', 'D', 'E', 'F'].includes(name)){
          document.getElementById(name+'3').click();
        }
        return;
      }

      // 禁用上下键移动屏幕
      if (e.code.startsWith('Arrow')){
        e.preventDefault();
      }

      switch (e.code){
          // 换调和播放暂停
        case 'KeyI':
        case 'ArrowUp':
          this.onUp(e);
          break;
        case 'KeyK':
        case 'ArrowDown':
          this.onDown(e);
          break;
        case 'KeyJ':
        case 'ArrowLeft':
          this.playKeyNote(e);
          break;
        case 'KeyL':
        case 'ArrowRight':
          this.play(e);
          break;
        case 'Semicolon':
          this.stopPlaying(e);
          break;

          // 换曲子
        case 'KeyS':{
          const newValue = (+songList.value+1)%songList.length;
          songList[newValue].checked = true;
          songList[newValue].dispatchEvent(new Event('change', {bubbles: true}));
          break;
        }
        case 'KeyW':{
          const len = songList.length;
          const newValue = ((+songList.value-1)%len+len)%len;
          songList[newValue].checked = true;
          songList[newValue].dispatchEvent(new Event('change', {bubbles: true}));
          break;
        }

          // 调间隔
        case 'KeyA':{
          document.getElementById('intervalDown').click();
          break;
        }
        case 'KeyD':{
          document.getElementById('intervalUp').click();
          break;
        }
        case 'KeyQ':{
          document.getElementById('intervalDownOne').click();
          break;
        }
        case 'KeyE':{
          document.getElementById('intervalUpOne').click();
          break;
        }

          // 播放最低和最高音
        case 'KeyU':
          this.playLow(e);
          break;
        case 'KeyO':
          this.playHigh(e);
          break;
      }
    };
  },
};
const app = Vue.createApp(APP);
app.mount('#app');

// 唱名转换成音名
function toName(s){
  const numberMap = ['', 'C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const n = s.match(/\d/)?.[0];

  if (!n){
    return '-';
  }

  let r = numberMap[n];
  if (s.includes('#')){
    r += '#';
  } else if (s.includes('b')){
    r += 'b';
  }

  r += 3+s.match(/\d(\.*)/)[1].length-s.match(/(\.*)\d/)[1].length;

  return r;
}

