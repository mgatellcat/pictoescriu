// Motor simulat per a les proves (no és ONNX Runtime): genera silenci proporcional al nombre de sons
window.ort = {
  env: {wasm: {}}, __runs: [], __created: 0,
  Tensor: function(type, data, dims){ this.type = type; this.data = data; this.dims = dims; },
  InferenceSession: {
    create: async function(){
      window.ort.__created++; window.ort.__paths = Object.keys(window.ort.env.wasm.wasmPaths || {}).join(',') + ' ' + Object.values(window.ort.env.wasm.wasmPaths || {}).map(function(u){ return String(u).slice(0, 5); }).join(',');
      return {run: async function(feeds){
        var n = Number(feeds.input_lengths.data[0]), scale = feeds.scales.data[1];
        window.ort.__runs.push({n: n, sid: feeds.sid ? Number(feeds.sid.data[0]) : null, scale: scale});
        return {output: {data: new Float32Array(Math.round(n * 500 * scale))}};
      }};
    }
  }
};
