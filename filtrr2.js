var F = function(a, b, e) {
    var f = a[0].nodeName.toLowerCase(),
      c = a.position(),
      d = null,
      h = !1,
      j = b || null,
      b = function() {
        var b = new Image();
        b.src = a.attr("src");
        b.onload = $.proxy(function() {
          var f = $("<canvas>", {
              id: "filtrr2-" + a.attr("id"),
              class: a.attr("class"),
              style: a.attr("style")
            }).css({
              width: b.width,
              height: b.height,
              top: c.top,
              left: c.left
            }),
            d = f[0];
          this.canvas = f;
          d.width = b.width;
          d.height = b.height;
          d.getContext("2d").drawImage(b, 0, 0);
          a.hide();
          a.parent().append(f);
          this.processor = new Filtrr2.ImageProcessor(this);
          j && j.call(this.processor);
          h = !0;
        }, this);
      };
    this.el = a;
    this.created = e;
    this.canvas = this.processor = null;
    d = new Filtrr2.Events();
    this.on = $.proxy(function(a, b) {
      d.on(a, b, this);
    }, this);
    this.off = d.off;
    this.trigger = d.trigger;
    this.ready = function(a) {
      if (!a) return h;
      j = a;
      h && j.call(this.ip);
    };
    this.update = function(a) {
      a && h && a.call(this.processor);
    };
    this.save = function(a) {
      var b = "image/" + (a || "png");
      h &&
        ((a = this.canvas[0].toDataURL(b)),
        -1 == a.indexOf(b) && (b = "image/png"),
        (a = a.replace(b, "image/octet-stream")),
        (window.location.href = a));
    };
    this.reset = function() {
      if (h) return this.processor.reset();
    };
    if ("img" == f) b.call(this, a);
    else if ("canvas" == f)
      (this.canvas = a),
        (this.processor = new Filtrr2.ImageProcessor(this)),
        j && j.call(this.processor),
        (h = !0);
    else throw Error("'" + f + "' is an invalid object.");
    return this;
  },
  Filtrr2 = (function() {
    var a = {};
    if (null == $("<canvas/>")[0].getContext("2d"))
      throw Error("Canvas is not supported in this browser.");
    return function(b, e, f) {
      var c, d, h;
      null == f && (f = { store: !0 });
      if ("undefined" === typeof b || null === b)
        throw Error("The element you gave Filtrr2 was not defined.");
      c = typeof b;
      d = b;
      c = (h =
        "string" === c ||
        ("object" === c && -1 < b.constructor.toString().indexOf("String")))
        ? b
        : b.selector;
      if (a[c]) return a[c].F;
      h && (d = $(b));
      if (0 === d.length) throw Error("Element not found.");
      b = new Date().getTime();
      e = new F(d, e, b);
      f.store && (a[c] = { timestamp: b, F: e });
      return e;
    };
  })();
Filtrr2.FxStore = (function() {
  var a = {},
    b = {},
    e = 0;
  b.add = function(b, c) {
    a[b] = c;
    e++;
  };
  b.count = function() {
    return e;
  };
  b.get = function(b) {
    return a[b];
  };
  b.getNames = function() {
    var b = [],
      c = null;
    for (c in a) a.hasOwnProperty(c) && b.push(c);
    return b;
  };
  return b;
})();
Filtrr2.fx = function(a, b) {
  Filtrr2.FxStore.add(a, b);
};
Filtrr2.ImageProcessor = function(a) {
  for (
    var b = a.canvas[0],
      e = b.width,
      f = b.height,
      c = b.getContext("2d"),
      d = function(a) {
        for (
          var b = c.createImageData(a),
            f = b.data,
            a = a.data,
            h = a.length,
            d = 0,
            d = 0;
          d < h;
          d++
        )
          f[d] = a[d];
        return b;
      },
      h = Filtrr2.Util.clamp,
      j = c.getImageData(0, 0, e, f),
      g = d(j),
      k = new Filtrr2.Layers(),
      b = Filtrr2.FxStore.getNames(),
      m = b.length,
      i = 0,
      l = null,
      v = this,
      i = 0;
    i < m;
    i++
  )
    (l = b[i]),
      (this[l] = (function(a, b) {
        return $.proxy(function() {
          var f = Filtrr2.FxStore.get(a);
          b.trigger(a + ":preprocess");
          f.apply(this, arguments);
          b.trigger(a + ":postprocess");
          return this;
        }, v);
      })(l, a));
  this.dup = function() {
    return new Filtrr2.ImageProcessor(a);
  };
  this.buffer = function() {
    return j;
  };
  this.dims = function() {
    return { w: e, h: f };
  };
  this.reset = function() {
    j = d(g);
    return this;
  };
  this.layer = function(a, b) {
    k.merge(a, this, b);
    return this;
  };
  this.render = function(b) {
    a.trigger("prerender");
    c.putImageData(j, 0, 0);
    a.trigger("postrender");
    b && b.call(this);
    a.trigger("finalize");
  };
  this.process = function(a) {
    for (var b = j.data, d = 0, c = 0, d = 0; d < f; d++)
      for (c = 0; c < e; c++) {
        var g = 4 * d * e + 4 * c,
          i = { r: b[g], g: b[g + 1], b: b[g + 2], a: b[g + 3] };
        a(i, c, d);
        b[g] = parseInt(h(i.r));
        b[g + 1] = parseInt(h(i.g));
        b[g + 2] = parseInt(h(i.b));
        b[g + 3] = parseInt(h(i.a));
      }
    return this;
  };
  this.convolve = function(b) {
    if (!c.createImageData) throw "createImageData is not supported.";
    for (
      var a = c.createImageData(j.width, j.height),
        d = a.data,
        g = j.data,
        i = parseInt(b.length / 2),
        k = parseInt(b[0].length / 2),
        n = 0,
        o = 0,
        p = 0,
        q = 0,
        n = 0;
      n < f;
      n++
    )
      for (o = 0; o < e; o++) {
        for (
          var l = 4 * n * e + 4 * o, m = 0, s = 0, t = 0, p = -i;
          p <= i;
          p++
        )
          for (q = -k; q <= k; q++)
            if (0 <= n + p && n + p < f && 0 <= o + q && o + q < e) {
              var r = b[p + i][q + k];
              if (0 !== r)
                var u = 4 * (n + p) * e + 4 * (o + q),
                  m = m + g[u] * r,
                  s = s + g[u + 1] * r,
                  t = t + g[u + 2] * r;
            }
        d[l] = h(m);
        d[l + 1] = h(s);
        d[l + 2] = h(t);
        d[l + 3] = 255;
      }
    j = a;
    return this;
  };
};
Filtrr2.fx("adjust", function(a, b, e) {
  this.process(function(f) {
    f.r *= 1 + a;
    f.g *= 1 + b;
    f.b *= 1 + e;
  });
});
Filtrr2.fx("brighten", function(a) {
  a = Filtrr2.Util.normalize(a, -255, 255, -100, 100);
  this.process(function(b) {
    b.r += a;
    b.g += a;
    b.b += a;
  });
});
Filtrr2.fx("alpha", function(a) {
  a = Filtrr2.Util.normalize(a, 0, 255, -100, 100);
  this.process(function(b) {
    b.a = a;
  });
});
Filtrr2.fx("saturate", function(a) {
  a = Filtrr2.Util.normalize(a, 0, 2, -100, 100);
  this.process(function(b) {
    var e = (b.r + b.g + b.b) / 3;
    b.r = e + a * (b.r - e);
    b.g = e + a * (b.g - e);
    b.b = e + a * (b.b - e);
  });
});
Filtrr2.fx("invert", function() {
  this.process(function(a) {
    a.r = 255 - a.r;
    a.g = 255 - a.g;
    a.b = 255 - a.b;
  });
});
Filtrr2.fx("posterize", function(a) {
  var a = Filtrr2.Util.clamp(a, 1, 255),
    b = Math.floor(255 / a);
  this.process(function(a) {
    a.r = Math.floor(a.r / b) * b;
    a.g = Math.floor(a.g / b) * b;
    a.b = Math.floor(a.b / b) * b;
  });
});
Filtrr2.fx("gamma", function(a) {
  a = Filtrr2.Util.normalize(a, 0, 2, -100, 100);
  this.process(function(b) {
    b.r = Math.pow(b.r, a);
    b.g = Math.pow(b.g, a);
    b.b = Math.pow(b.b, a);
  });
});
Filtrr2.fx("contrast", function(a) {
  a = Filtrr2.Util.normalize(a, 0, 2, -100, 100);
  this.process(function(b) {
    b.r = 255 * ((b.r / 255 - 0.5) * a + 0.5);
    b.g = 255 * ((b.g / 255 - 0.5) * a + 0.5);
    b.b = 255 * ((b.b / 255 - 0.5) * a + 0.5);
  });
});
Filtrr2.fx("sepia", function() {
  this.process(function(a) {
    var b = a.r,
      e = a.g,
      f = a.b;
    a.r = 0.393 * b + 0.769 * e + 0.189 * f;
    a.g = 0.349 * b + 0.686 * e + 0.168 * f;
    a.b = 0.272 * b + 0.534 * e + 0.131 * f;
  });
});
Filtrr2.fx("subtract", function(a, b, e) {
  this.process(function(f) {
    f.r -= a;
    f.g -= b;
    f.b -= e;
  });
});
Filtrr2.fx("fill", function(a, b, e) {
  this.process(function(f) {
    f.r = a;
    f.g = b;
    f.b = e;
  });
});
Filtrr2.fx("blur", function(a) {
  a = a || "simple";
  "simple" == a
    ? this.convolve([
        [1 / 9, 1 / 9, 1 / 9],
        [1 / 9, 1 / 9, 1 / 9],
        [1 / 9, 1 / 9, 1 / 9]
      ])
    : "gaussian" == a &&
      this.convolve([
        [1 / 273, 4 / 273, 7 / 273, 4 / 273, 1 / 273],
        [4 / 273, 16 / 273, 26 / 273, 16 / 273, 4 / 273],
        [7 / 273, 26 / 273, 41 / 273, 26 / 273, 7 / 273],
        [4 / 273, 16 / 273, 26 / 273, 16 / 273, 4 / 273],
        [1 / 273, 4 / 273, 7 / 273, 4 / 273, 1 / 273]
      ]);
});
Filtrr2.fx("sharpen", function() {
  this.convolve([[0, -0.2, 0], [-0.2, 1.8, -0.2], [0, -0.2, 0]]);
});
Filtrr2.fx("curves", function(a, b, e, f) {
  var c = new Filtrr2.Util.Bezier(a, b, e, f).genColorTable();
  this.process(function(a) {
    a.r = c[a.r];
    a.g = c[a.g];
    a.b = c[a.b];
  });
});
Filtrr2.fx("expose", function(a) {
  a = Filtrr2.Util.normalize(a, -1, 1, -100, 100);
  this.curves(
    { x: 0, y: 0 },
    { x: 0, y: 255 * a },
    { x: 255 - 255 * a, y: 255 },
    { x: 255, y: 255 }
  );
});
Filtrr2.Util = (function() {
  var a = {},
    b = function(a, b, d) {
      return Math.min(d || 255, Math.max(b || 0, a));
    },
    e = function(a, b) {
      return Math.sqrt(Math.pow(b - a, 2));
    };
  a.clamp = b;
  a.dist = e;
  a.normalize = function(a, c, d, h, j) {
    var g = e(h, j),
      d = e(c, d) / g,
      a = b(a, h, j);
    return c + (a - h) * d;
  };
  a.Bezier = function(a, b, d, h) {
    this.genColorTable = function() {
      var e = {},
        g;
      for (g = 0; 1024 > g; g++) {
        var k =
          ((a.y * g) / 1024) * (g / 1024) * (g / 1024) +
          b.y * 3 * (g / 1024) * (g / 1024) * (1 - g / 1024) +
          d.y * 3 * (g / 1024) * (1 - g / 1024) * (1 - g / 1024) +
          h.y * (1 - g / 1024) * (1 - g / 1024) * (1 - g / 1024);
        e[
          parseInt(
            ((a.x * g) / 1024) * (g / 1024) * (g / 1024) +
              b.x * 3 * (g / 1024) * (g / 1024) * (1 - g / 1024) +
              d.x * 3 * (g / 1024) * (1 - g / 1024) * (1 - g / 1024) +
              h.x * (1 - g / 1024) * (1 - g / 1024) * (1 - g / 1024)
          )
        ] = parseInt(k);
      }
      return e;
    };
  };
  return a;
})();
Filtrr2.Events = function() {
  var a = {};
  this.on = function(b, e, f) {
    a[b] || (a[b] = []);
    void 0 === f && (f = null);
    a[b].push({ cback: e, ctx: f });
  };
  this.off = function(b, e) {
    var f = 0,
      c = [],
      d = null;
    if (a[b] && 0 < a[b].length)
      if (e) {
        c = a[b];
        for (f = 0; f < c.length; f++)
          c.hasOwnProperty(f) && ((d = c[f]), d.cback === e && delete c[f]);
      } else a[b] = [];
  };
  this.trigger = function(b) {
    var e = a[b],
      f = null,
      c = null,
      d = [].slice.apply(arguments);
    for (f in e)
      e.hasOwnProperty(f) && (c = e[f]) && c.cback.apply(c.ctx, d.slice(1));
  };
};
Filtrr2.Layers = function() {
  var a = Filtrr2.Util.clamp,
    b = function(b, c, d) {
      for (
        var h = b.buffer().data,
          e = c.buffer().data,
          g = 0,
          k = 0,
          m = Math.min(b.dims().h, c.dims().h),
          b = Math.min(b.dims().w, c.dims().w),
          i,
          l,
          g = 0;
        g < m;
        g++
      )
        for (k = 0; k < b; k++)
          (c = 4 * g * b + 4 * k),
            (i = { r: h[c], g: h[c + 1], b: h[c + 2], a: h[c + 3] }),
            (l = { r: e[c], g: e[c + 1], b: e[c + 2], a: e[c + 3] }),
            d(i, l),
            (h[c] = a(i.r)),
            (h[c + 1] = a(i.g)),
            (h[c + 2] = a(i.b)),
            (h[c + 3] = a(i.a));
    },
    e = {
      multiply: function(a, c) {
        b(a, c, function(a, b) {
          a.r = (b.r * a.r) / 255;
          a.g = (b.g * a.g) / 255;
          a.b = (b.b * a.b) / 255;
        });
      },
      screen: function(a, c) {
        b(a, c, function(a, b) {
          a.r = 255 - ((255 - b.r) * (255 - a.r)) / 255;
          a.g = 255 - ((255 - b.g) * (255 - a.g)) / 255;
          a.b = 255 - ((255 - b.b) * (255 - a.b)) / 255;
        });
      },
      overlay: function(a, c) {
        var d = function(a, b) {
          return 128 < a
            ? 255 - (2 * (255 - b) * (255 - a)) / 255
            : (2 * a * b) / 255;
        };
        b(a, c, function(a, b) {
          a.r = d(a.r, b.r);
          a.g = d(a.g, b.g);
          a.b = d(a.b, b.b);
        });
      },
      softLight: function(a, c) {
        var d = function(a, b) {
          a /= 255;
          b /= 255;
          return 0.5 > b
            ? 255 * ((1 - 2 * b) * a * a + 2 * b * a)
            : 255 * ((1 - (2 * b - 1)) * a + (2 * b - 1) * Math.pow(a, 0.5));
        };
        b(a, c, function(a, b) {
          a.r = d(a.r, b.r);
          a.g = d(a.g, b.g);
          a.b = d(a.b, b.b);
        });
      },
      addition: function(a, c) {
        b(a, c, function(a, b) {
          a.r += b.r;
          a.g += b.g;
          a.b += b.b;
        });
      },
      exclusion: function(a, c) {
        b(a, c, function(a, b) {
          a.r = 128 - (2 * (a.r - 128) * (b.r - 128)) / 255;
          a.g = 128 - (2 * (a.g - 128) * (b.g - 128)) / 255;
          a.b = 128 - (2 * (a.b - 128) * (b.b - 128)) / 255;
        });
      },
      difference: function(a, c) {
        var d = Math.abs;
        b(a, c, function(a, b) {
          a.r = d(b.r - a.r);
          a.g = d(b.g - a.g);
          a.b = d(b.b - a.b);
        });
      }
    };
  this.merge = function(a, b, d) {
    if (null != e[a]) e[a](b, d);
    else throw Error("Unknown layer blend type '" + a + "'.");
  };
};
