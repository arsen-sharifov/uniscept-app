import type { IAuroraRenderer } from '@interfaces';

import { AURORA_VERTEX_SHADER, AURORA_FRAGMENT_SHADER } from '../consts';

export const createAuroraRenderer = (
  surface: HTMLCanvasElement | OffscreenCanvas,
  renderScale: number,
): IAuroraRenderer | null => {
  const canvas = surface as HTMLCanvasElement;

  const gl = canvas.getContext('webgl', {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    preserveDrawingBuffer: true,
  });
  if (!gl) return null;

  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    return shader;
  };

  const vertex = compile(gl.VERTEX_SHADER, AURORA_VERTEX_SHADER);
  const fragment = compile(gl.FRAGMENT_SHADER, AURORA_FRAGMENT_SHADER);
  const program = gl.createProgram();
  if (!vertex || !fragment || !program) return null;

  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;

  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  gl.useProgram(program);

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const positionLocation = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  const resolutionLocation = gl.getUniformLocation(program, 'resolution');
  const timeLocation = gl.getUniformLocation(program, 'time');
  const paperLocation = gl.getUniformLocation(program, 'paper');

  const resize = (cssWidth: number, cssHeight: number) => {
    const width = Math.max(1, Math.round(cssWidth * renderScale));
    const height = Math.max(1, Math.round(cssHeight * renderScale));

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    gl.viewport(0, 0, width, height);
    gl.uniform2f(resolutionLocation, width, height);
  };

  const draw = (elapsedSeconds: number, paper: number) => {
    gl.uniform1f(paperLocation, paper);
    gl.uniform1f(timeLocation, elapsedSeconds);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  return { resize, draw };
};
