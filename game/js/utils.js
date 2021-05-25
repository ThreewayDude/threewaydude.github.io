export function createShader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

export function createProgram(gl, vertShader, fragShader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

export function createProgramFromScripts(gl, scriptIds) {
    const defaultShaderType = [gl.VERTEX_SHADER, gl.FRAGMENT_SHADER];
    var shaders = [];
    for (let i = 0; i < scriptIds.length; i++) {
        var source = document.getElementById(scriptIds[i]).innerText;
        shaders.push(createShader(gl, defaultShaderType[i], source));
    }

    return createProgram(gl, shaders[0], shaders[1]);
}

export function resizeCanvasToDisplaySize(canvas) {
    const width  = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== width ||  canvas.height !== height) {
        canvas.width  = width;
        canvas.height = height;
        return true;
    }
    return false;
}