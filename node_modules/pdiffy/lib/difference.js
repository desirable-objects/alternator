var isServer = typeof module !== 'undefined';

var compare = function(pixels) {
  var pix = [];
  for (var x = 0, len = pixels.length; x < len; x++) {
    for (var y = 0, len2 = pixels.length; y < len2; y++) {
      pix.push(Math.abs(pixels[x] - pixels[y]));
    }
  }
  return Math.max.apply(Math, pix);
};

var getBrightness = function(r, g, b) {
  return Math.round(0.3 * r + 0.59 * g + 0.11 * b);
};

var getPixel = function(arr, i) {
  var output, pix, _i;
  output = [];
  for (_i = arr.length - 1; _i >= 0; _i += -1) {
    pix = arr[_i] || 0;
    output.unshift(pix.data.data[i]);
  }
  return output;
};

var isRGBSimilar = function(r, g, b, tolerance) {
  return r <= tolerance.red && g <= tolerance.green && b <= tolerance.blue;
};

var isBrightnessSimilar = function(brightness, tolerance) {
  return brightness < tolerance.minBrightness;
};

var extend = function(dest, src) {
  for (key in src) {
    if (src.hasOwnProperty(key)) {
      dest[key] = src[key];
    }
  }
  return dest;
};

var getMaxBrightness = function(array) {
  return Math.max.apply(Math, array);
};

var getBrightnessPixels = function(r, g, b) {
  var pixels = [];

  for (var i = 0, len = r.length; i < len; i++) {
    pixels.push(getBrightness(r[i], g[i], b[i]));
  }

  return pixels;
};

var compute = function(options) {
  var tolerance = extend({
    minBrightness: 16,
    maxBrightness: 240,
    red: 16,
    green: 16,
    blue: 16
  }, options.tolerance || {});

  var b, context, contextData, data, g, i, imageData, isDifferent, isUnderThreshold, maxLength, maxValue, mode, outputData, r, _i;
  data = options.imageData;
  outputData = {
    numberOfSamePixels: 0,
    numberOfDifferentPixels: 0,
    totalPixels: 0
  };

  var ignoreColors = options.ignoreColors;

  context = options.contextData;
  contextData = context.data;

  maxLength = Math.max.apply(Math, data.map(function(a) {
    return a.data.data.length;
  }));
  
  mode = options.mode;

  for (i = _i = 0; _i < maxLength; i = _i += 4) {
    r = getPixel(data, i);
    g = getPixel(data, i + 1);
    b = getPixel(data, i + 2);

    if (ignoreColors) {
      var brightnessPixels = getBrightnessPixels(r, g, b);
      var maxBrightness = getMaxBrightness(brightnessPixels);
      isUnderThreshold = isBrightnessSimilar(compare(brightnessPixels), tolerance);
    }
    
    r = compare(r);
    g = compare(g);
    b = compare(b);

    if (!ignoreColors) {
      isUnderThreshold = isRGBSimilar(r, g, b, tolerance);
    }

    if (isUnderThreshold) {
      r = g = b = (ignoreColors ? maxBrightness : 0);
      outputData.numberOfSamePixels++;
    } else {
      outputData.numberOfDifferentPixels++;

      if (mode === "heatmap") {
        maxValue = ignoreColors ? maxBrightness : Math.max(r, g, b);
        r = maxValue;
        g = ignoreColors ? 0 : maxValue;
        b = ignoreColors ? maxValue : 0;
      } else if (mode === "subtraction") { 
        // We don't need to do anything here since we already did a subtraction,
        // but we want block to be our fall through
      } else {
        r = 255;
        g = ignoreColors ? 0 : 255;
        b = ignoreColors ? 255 : 0;
      }
    }

    contextData[i] = r;
    contextData[i + 1] = g;
    contextData[i + 2] = b;
    contextData[i + 3] = 255;
    outputData.totalPixels++;
  }

  imageData = {
    event: "done",
    id: options.id,
    data: context,
    y: options.startY,
    block: options.block,
    stats: outputData
  };

  if (isServer) {
    return imageData;
  } else {
    self.postMessage(imageData);
    self.close();
  }
};

if (isServer) {
  module.exports = {
    compute: compute,
    getBrightness: getBrightness
  };
} else {
  self.addEventListener('message', function(e) {
    return compute(e.data);
  });
}

