function isArray(a) {
    return Array.isArray(a);
}

function isPlainObj(o) {
    return Object.prototype.toString.call(o) === '[object Object]';
}

(function(root, name, factory) {
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define([name], factory);
    } else {
        root[name] = factory();
    }
    
})(this, 'YAML', function() {
    
    if (typeof toBool === 'undefined') {
        toBool = function(v) {
            if (v instanceof String) v = v.valueOf();
            if (typeof v === 'string' && v) {
                return !/f(?:alse)|off|none|no?|0|faux|ko|nok/.test(v);
            }
            return !!v;
        }
    }
    
    function YAMLObject() {
        
    }
    
    
    YAMLObject.prototype.toString = function(indent, indentFirstLine) {
        throw new Error("Abstract method call");
    };
    
    function SingleLineText(s) {
        this.__str_ = "";
        if (s instanceof String) s = s.valueOf();
        if (typeof s === 'string') this.__str_ = s;
    };
    
    SingleLineText.prototype = new YAMLObject();
    SingleLineText.__CLASS__ = SingleLineText.prototype.__CLASS__ = SingleLineText;
    
    SingleLineText.__CLASS_NAME__ = SingleLineText.prototype.__CLASS_NAME__ = "SingleLineText";
    
    SingleLineText.prototype.clear = function() {
        this.__str_ = "";
        return this;
    };
    
    SingleLineText.prototype.append = function(s) {
        this.__str_ += s;
        return this;
    };
    /**
     * 
     * @param {Number|String} [indent=0]
     * @param {Boolean} [indentFirstLine=true]
     * @return {String}
     */
    SingleLineText.prototype.toString = function(indent, indentFirstLine, lineMaxChars) {
        if (arguments.length < 2) {
            indentFirstLine = true;
        }
        var sIndent = "", s = "", j, len, str = this.__str_||"", i, n = str.length, offs;
        indent = indent === true ? 1 : indent||0;
        if (typeof indent === 'number') {
            for (i = 0; i < indent; i++) {
                sIndent += "  ";
            }
        }
        
        if (str && typeof lineMaxChars === 'number' && lineMaxChars > 0) {
            i = len = lineMaxChars - sIndent.length;
            offs = 0;
            while (i < n) {
                if (!/[ \t]/.test(str[i])) {
                    for (j = i;j >= offs;j--)  {
                        if (/[ \t]/.test(str[j])) {
                            break;
                        }
                    }
                }
                if (j < offs) {
                    for (j = i; j < n; j++) {
                        if (/[ \t]/.test(str[j]))
                            break;
                    }
                    s += "\n" + str.substring(offs, j);
                } else {
                    s += "\n" + str.substring(offs, j).trim();
                }
                offs = j + 1;
                i = offs + len;
                if (offs < n && i > n) i = n - 1;
            }
            return (indentFirstLine ? sIndent : "") + '>' + s;
        } else {
            return (indentFirstLine ? sIndent : "") + '>' + str;
        }
    };
    
    
    
    
    function MultileLinesText(t) {
        this.lines = [];
        
        if (typeof t instanceof String) t = t.valueOf();
        if (typeof t === 'string') {
            t = t.split(/\n|\r\n?/);
        }
        if (isArray(t)) {
            this.append(t);
        }
    };
    
    MultileLinesText.prototype = new YAMLObject();
    MultileLinesText.__CLASS__ = MultileLinesText.prototype.__CLASS__ = MultileLinesText;
    
    MultileLinesText.__CLASS_NAME__ = MultileLinesText.prototype.__CLASS_NAME__ = "MultileLinesText";
    
    /**
     * 
     * @param {Number|String} [indent=0]
     * @param {Boolean} [indentFirstLine=true]
     * @return {String}
     */
    MultileLinesText.prototype.toString = function(indent, indentFirstLine) {    
        var len = arguments.length;
        if (len < 2) {
            indentFirstLine = true;
        }
        if (len === 0 && this.__str__) return this.__str__;
        var sInd = "";
        indent = indent === true ? 1 : indent||0;
        if (typeof indent === 'number') {
            for (var i = 0; i < indent; i++) {
                sInd += "  ";
            }
        }
        var str = (indentFirstLine ? sInd : "") + '|';
        this.lines.forEach(function(l) {
            str += "\n" + sInd + l;
        });
        if (len === 0) this.__str__ = str;
        return str;
    };
    
    MultileLinesText.prototype.getString = MultileLinesText.prototype.toString;
    
    MultileLinesText.prototype.setString = function(t) {
        if (typeof t instanceof String) t = t.valueOf();
        if (typeof t === 'string') {
            this.append(t.split(/\n|\r\n?/));
        } else {
            throw new Error("Incorrect arguments");
        }
        return this;
    };
    
    Object.defineProperty(MultileLinesText.prototype, 'value', {
        get: MultileLinesText.prototype.getString,
        set: MultileLinesText.prototype.setString
    });
    
    MultileLinesText.prototype.stringValue = MultileLinesText.prototype.toString;
    
    MultileLinesText.prototype.clear = function() {
        this.lines = [];
        this.__str__ = "";
        return this;
    };
    
    MultileLinesText.prototype.append = function(str) {
        if (typeof str === 'string') {
            this.lines.push(str);
        } else if (isArray(str)) {
            str.forEach(function(s) {
                if (typeof s === 'string') {
                    this.lines.push(s);
                } else {
                    throw new Error("Incorrect arguments");
                }
            });
        } else {
            throw new Error("Incorrect arguments");
        }
        this.__str__ = undefined;
        return this;
    };
    
    function InlineObject() {
        
    }
    
    InlineObject.prototype = new YAMLObject();
    
    function InlineArray() {
        
    }
    
    InlineArray.prototype = new YAMLObject();
    
    
    /**
     * <h3>PObject class</h3>
     * YAML Object representing a pair. Each object of the pair is an array:
     * <ul>
     *    <li>The first array is an array of string: represents the names.</li>
     *    <li>The second array can contain any value or object.</li>
     * </ul>
     * <p>The two array have the same length.</p>
     * <p>In the example below, the part that is bold corresponds to a PObject</p>
     * <div>
     * <h4>Example of YAML with PObject</h4>
     * <pre>
     * --- # The Smiths<br>
     * - {name: John Smith, age: 33}"
     * - name: Mary Smith<br>
     *   age: 27<br>
     * - <b>[name, age]: [Rae Smith, 4]</b>   # sequences as keys are supported<br>
     * --- # People, by gender<br>
     * men: [John Smith, Bill Jones]<br>
     * women:<br>
     *   - Mary Smith<br>
     *   - Susan Williams<br>
     * </pre>
     * </div>
     * @param {Array|Object} [$1]
     * @param {Array} [$2]
     * @class PObject
     */
    function PObject($1, $2) {
        var o, names, values;
        if (!(this instanceof PObject)) {
            if (arguments.length === 1) {
                return new PObject($1);
            } else if (arguments.length) {
                return new PObject($1, $2);
            } else {
                return  new PObject();
            }
        }
        if (arguments.length > 1) {
            if (!isArray($1) || !isArray($2)) {
                throw new Error("Incorrect argument");
            }
        } else if (isPlainObj(o = $1)) {
            if (isArray($2 = o.values)) {
                if (!isArray($1 = o.fields||o.names||o.propertyNames||o.properties)) {
                    throw new Error("Incorrect argument");
                }
            } else {
                names = [];
                values = [];
                for (var k in o) {
                    names.push(k);
                    values.push(o[k]);
                }
            }
        } else if (isArray($1) && $1.length === 2 && isArray($1[0]) && isArray($2=$1[1])) {
            $1 = $1[0];
        } else if (arguments.length) {
            throw new Error("Incorrect arguments");
        } else {
            $1 = $2 = [];
        }
        
        if($1.length !== $2.length) {
            throw new Error("Incorrect arguments");
        }
        var props = {};
        if (!names) {
            names = [];
            values = [];
            $1.forEach(function(n, i) {
                if (n instanceof String) n = n.valueOf();
                if (typeof n != 'string')
                    throw new Error("Incorrect arguments");
                names[i] = n;
                values[i] = $2[i];
                props[n] = { name: n, value: $2[i], writable: true, configurable: true, enumerable: true };
            });
        }
        props['__'] = { 
            name: '__',
            value: {
                names : names,
                values : values
            },
            writable: false,
            configurable: false, 
            enumerable: false
        };
        Object.defineProperties(this, props);        
    }
    
    PObject.prototype = new YAMLObject();
    
    PObject.prototype.getPropertyNames = function() {
        return this.__.names;
    };
    
    PObject.prototype.getPropertyValues = function() {
        return this.__.values;
    };
    
    PObject.prototype.setPropertyValue = function(name, val) {
        var i;
        if ((i = this.__.names.indexOf(name)) >= 0) {
            this.__.values[i] = val;
        } else {
            this.__.names.push(name);
            this.__.values.push(name);
        }
        Object.defineProperty(this, name, {
            name: name,
            value: val,
            configurable : true,
            enumerable: true,
            writable: true
        });
        return this;
    };
    
    PObject.set = function($1) {
        function setPairs(arr) {
            var i = 0, n = arr.length, name, o;
            n = (n - (n%2))/2
            for (; i < n; i++) {
                name = arr[2*i];
                if (typeof name !== 'string' && !(name instanceof String)) {
                    break;
                }
                self.setPropertyValue(name, arr[2*i + 1]);
            }
        }
        var args = Array.prototype.slice.call(arguments), i, n, name, o, self = args[args.length - 1];
        if (!(self instanceof PObject)) {
            throw new Error("Incorrect arguments");
        }
        
        args.splice(args.length - 1, 1);
        
        if ($1 instanceof String) {
            args[0] = $1 = $1.valueOf();
        }
        if (isArray($1) && args.length === 1) {
            if (typeof $1[0] !== 'string') {
                throw new Error("Incorrect arguments");
            }
            setPairs($1);
        } else if (isPlainObj($1)) {
            for (i = 0, n = args.length; i < n; i++) {
                if (!isPlainObj(o=arr[i])) {
                    break;
                }
                for (name in o) {
                    self.setPropertyValue(name, o[name]);
                }
            }
        } else if (typeof $1 === 'string') {
            if ((n = args.length) > 2) {
                setPairs(args);
            } else {
                self.setPropertyValue($1, args[1]);
            }
        }
    };
    /**
     * 
     * @return {PObject}
     */
    PObject.prototype.set = function($) {
        $ = Array.prototype.slice.call(arguments);
        $.push(this);
        PObject.set.apply(PObject, $);
        return this;
    };
    
    PObject.prototype.toString = function(indent, indentFirstLine) {
        var yaml1 = "", yaml2 = "", vals = this.__.values, delim, count, _indent;
        if (indentFirstLine && typeof (count = indent) === 'number') {
            indent = "";
            _indent = YAML.singleIndent||YAML.SINGLE_INDENT||"  ";
            for (var j= 0; j < count; j++) {
                indent += _indent;
            }
        } else {
            indent = indentFirstLine ? indent||"" : "";
        }
        this.__.names.forEach(function(n, i) {
            yaml1 += (delim||( delim = i ? ", " : "")) + YAML.stringify(n, 0);
            yaml2 += delim + YAML.stringify(vals[i], { inline : true });
        });
        
        return indent + "[" + yaml1 + "]: [" + yaml2 + "]";
    };
    
    function Url(u) {
        if (u instanceof String) u = u.valueOf();
        if (typeof u === 'string') {
            this.url = u;
        } else if (isPlainObj(u)) {
            this.name = u.name||u.label||"";
            this.url = u.url||u.uri;
        }
    }
    
    Url.prototype = new YAMLObject();
    
    Url.__CLASS__ = Url.prototype.__CLASS__ = Url;
    
    Url.__CLASS_NAME__ = Url.prototype.__CLASS_NAME__ = "Url";
    
    Url.prototype.getName = function() {
        return this.__name_;
    };
    
    Url.prototype.setName = function(name) {
        if (name instanceof String) name = name.valueOf;
        if (typeof name !== 'string') {
            throw new Error("Incorrect argument");
        }
        this.__name_ = name;
        return this;
    };
    
    Url.prototype.getUrl = function() {
        return this.__url_;
    };
    
    Url.prototype.setUrl = function(url) {
        if (url instanceof String) url = url.valueOf;
        if (typeof url !== 'string' || !url || !/^[a-zA-Z]+:\/\//.test(url)) {
            throw new Error("Incorrect argument");
        }
        this.__url_ = url;
        return this;
    };
    
    Object.defineProperties(Url.prototype, {
        url : {
            get: Url.prototype.getUrl,
            set: Url.prototype.setUrl
        },
        name : {
            get: Url.prototype.getName,
            set: Url.prototype.setName
        }
    });
    
    function Anchor(a) {
        if (a instanceof String) a = a.valueOf();
        if (typeof a === 'string') {
            this.text = a;            
        } else if (isPlainObj(a)) {
            this.text = a.text||a.string||a.name||"";
        }
    }
    
    Anchor.prototype = new YAMLObject();
    
    Anchor.prototype.toString = function() {
        return '%#' + (this.text||"");
    };
    
    function Chunk() {
        if (a instanceof String) a = a.valueOf();
        if (typeof a === 'string') {
            this.text = a;            
        } else if (isPlainObj(a)) {
            this.text = a.text||a.string||a.chunk||a.name||"";
        }
    }
    
    Chunk.prototype = new YAMLObject();
    
    Chunk.prototype.toString = function() {
        return this.text||"";
    };
    
    function CText(t) {
        if (isArray(t)) {
            this.chunks = t;
        } else if (isPlainObj(t)) {
            this.chunks = t.chunks||t.elements||t.components||[];
        } else {
            this.chunks = [];
        }
    };
    
    CText.prototype = new YAMLObject();
    
    CText.prototype.toString = function(indent, indentFirstLine) {
        var str = "";
        if (arguments.length < 2) {
            indentFirstLine = true;
        }
        var sInd = "";
        if (indentFirstLine) {
            indent = indent === true ? 1 : indent||0;
            if (typeof indent === 'number') {
                for (var i = 0; i < indent; i++) {
                    sInd += "  ";
                }
            }
        }
        this.chunks.forEach(function(c) {
            if (typeof c === 'string') {
                str += c;
            } else {
                str += c.toString();
            }
        });
        return sInd + str;
    };
    
    function Base64(b) {
        if (b instanceof String) b = b.valueOf();
        if (typeof b === 'string') {
            this.data = b;
        } else if (isPlainObj(b)) {
            this.data = b.data||b.text||b.value||b.string||"";
        }
    }
    
    Base64.prototype = new YAMLObject();
    /**
     * 
     * @param {String|Number} [indent=0]
     * @param {Boolean} [indentFirstLine=true]
     * @return {String}
     */
    Base64.prototype.toString = function(indent, indentFirstLine) {
        if (arguments.length< 2) {
            indentFirstLine = true;
        }
        var str, i;
        if (indent) {            
            if (typeof indent === 'number') {
                str = "";
                for (i = 0; i < indent; i++) {
                    str += "  ";
                }
            }
            return (indentFirstLine ? indent : "") + this.data.split(/\r\n?|\n/).join("\n" + indent);
        }
        return this.data||"";
    };
    
    Base64.prototype.getData = function() {
        return this.__data_;
    };
    
    Base64.prototype.setData = function(data) {
        if (data instanceof String) data = data.value();
        if (typeof data !== 'string') {
            throw new TypeError("Incorrect argument");
        }
        this.__data_ = data;
        return this;
    };
    
    Object.defineProperty(Base64.prototype, 'data', {
        get: Base64.prototype.getData,
        set: Base64.prototype.setData
    });
    
    function Heading(h) {
        if (arguments.length) {
            CText.call(this, h);
            if (isPlainObj(h)) {
                this.level = h.level||h.number||1;
            }
        } else {
            CText.call(this);
        }
    }
    
    Heading.prototype = new CText();
    
    Heading.prototype.toString = function() {
        return "%" + (this.level||1) + " " + CText.prototype.toString.call(this);
    };
    

    function YAML() {
        
    }
    
    YAML.prototype = new YAMLObject();
    
    YAML.__CLASS__ = YAML.prototype.__CLASS__ = YAML;
    
    YAML.__CLASS_NAME__ = YAML.prototype.__CLASS_NAME__ = "YAML";
    
    YAML.MultileLinesText = MultileLinesText;
    YAML.SingleLineText = SingleLineText;    
    YAML.Url = Url;
    YAML.Heading = Heading;
    YAML.Chunk = Chunk;
    YAML.Anchor = Anchor;    
    YAML.CText = CText;
    YAML.Base64 = Base64;
    YAML.InlineObject = InlineObject;
    YAML.InlineArray = InlineArray;
    YAML.IObject = InlineObject;
    YAML.IArray = InlineArray;
    YAML.PObject = PObject;
    
    function skipIndent(str, result) {
        var ch, i = 0, n = str.length, spaces = 0, tabSpaces = 4, s;
        for (;i<n;i++) {
            ch = str[i];
            if (ch === ' ') {
                spaces++;
            } else if (ch === '\t') {
                spaces += tabSpaces - ((spaces + tabSpaces) % tabSpaces);
            } else {
                break;
            }
        }
        result = result||{};
        result.spaces = spaces;
        result.index = i;
        return  result;
    }
    
    function split(s) {
        var i = 0, n = s.length, ch;
        for (;i<n;i++) {
            if (s[i] === ':' && s[i-1] !== '\\') {
                return [ s.substring(0, i).trim().replace(/\\:/g, ':'), s.substring(i + 1).trim()];
            }
        }
        return [s];
    }
    
    SingleLineText.LINE_MAX_CHARS = 80;
    
    function stringify(yaml, indent, singleIndent, indentFirstLine, opts) {
        var t, s = "", k, v;
        if (['string', 'number', 'boolean'].contains(t=typeof yaml)) {
            return (indentFirstLine ? indent : "") + yaml;
        } else if (isArray(yaml)) {
            yaml.forEach(function(y, i) {
                s += (i ? "\n" : "") + indent + "- " + stringify(yaml, indent + singleIndent);
            });
        }  else if (yaml instanceof Date) {
            
        } else if (yaml instanceof MultileLinesText) {
            s += yaml.toString(indent, false);
        } else if (yaml instanceof SingleLineText) {
            s += yaml.toString(indent, false, SingleLineText.LINE_MAX_CHARS||80);
        } else if (isPlainObj(yaml)) {
            for (k in yaml) {
                s += (i ? "\n" : "") + indent + k + ":";
                v = yaml[k];
                if (['string', 'number', 'boolean'].contains(typeof v)) {
                    s += v;
                } else {
                    s += "\n" + stringify(v, indent + singleIndent, singleIndent);
                }
            }
        } else if (typeof v === 'string' &&  (lines = v.split(/\r\n?|\n/)).length > 1) {
            lines.forEach(function(line, i) {
                s +=  (i ? "\n" : "") + (i || indentFirstLine ? indent : "") + line;
            });
        } else if (typeof yaml === 'function') {
            throw new Error("Function not supported");
        }
        return s;
    }
    
    YAML.stringify = function(yaml, indent, indentFirstLine, singleIndent, opts) {
        var x, y;
        if (isPlainObj(indent)) {
            if (arguments.length === 2) {
                opts = indent;
                indent = opts.indent||0;
                indentFirstLine = opts.indentFirstLine;
                singleIndent = opts.singleIndent||"  ";
            } else {
                x = opts;
                opts = indent;
                if (typeof indentFirstLine === 'number') {
                    indent = indentFirstLine;
                    indentFirstLine = x;
                }
            }
        } else if (isPlainObj(indentFirstLine)) {
            x = opts;
            opts = indentFirstLine
            indentFirstLine = x;
        }
        if(typeof indentFirstLine === 'string' || typeof indentFirstLine === 'number') {
            x = indentFirstLine;
            if (isPlainObj(singleIndent)) {
                y = singleIndent;
                singleIndent = x;
                indentFirstLine = opts;
                opts = y;
            } else {
                indentFirstLine = singleIndent;
                singleIndent = x;
            }
        }
        if (!indent) indent = 0;
        if (typeof indent === 'number') {
            var s = "";
            for (var i = 0; i < n; i++) {
                s += "  ";
            }
            indent = s;
        } else if (typeof indent !== 'string') {
            throw new Error("Incorrect arguments");
        }
        singleIndent = singleIndent|| "  ";
        indent = indent||"";
        return stringify(yaml, indent, singleIndent, indentFirstLine, opts);
    };
    
    
    YAML.format = YAML.stringify ;
    
    
    YAML.parse = function(str, opts) {
        var preserveTextIndent = !opts ? false : typeof opts === 'boolean' ? opts : opts.preserveTextIndentation||opts.preserveTextIndent;
        function preserveNewLinesText(spaces) {
            if (right.length > 1) throw new Error("");
            j++;
            var txt = "";
            var ind, s;
            for (;j < n;j++) {
                line = lines[j];
                indent = skipIndent(line, indent);
                if (indent.spaces <= spaces) {
                    break;
                }
                if (!ind) {
                    ind = line.substring(0, indent.index);
                }
                txt += (txt ? "\n" : "") + line.substring(ind.length);
            }
            return txt;
        }
        var processUrl = (opts||(opts={})).processUrl;
        function processData(data) {
            switch (annotation) {
                case 'binary':
                    return new Base64(data);
            }
            return data;
        }
        var annotation;
        function splitRight() {
            var match;
            if (match = /^!!([a-zA-Z_]+(?:\.[a-zA-Z_]+)*)/.exec(right)) {
                annotation = match[1];
                right = right.substring(match[0].length).trim();
            } else {
                annotation = "";
            }
        }
        function linesText(spaces) {
            var txt = "", s;
            if (right.length > 1) throw new Error("");
            j++;
            for (;j < n;j++) {
                line = lines[j];
                indent = skipIndent(line, indent);
                if (indent.spaces <= spaces) {
                    break;
                }
                s = line.substring(indent.index);
                if (s) txt += (txt ? " " : "") + s;
            }
            return txt;
        }
        function arrayItem(spaces) {    
            var n, oldSpaces =  spaces;
            if (line[i] !== '-') return false;
            while (line[i+1] === ' ') {
                o = levels[spaces];
                if (!o) {
                    o = levels[spaces] = [];
                } else if (!isArray(o)) {
                    throw new Error("Item expected");
                }
                if (_key) {
                    levels[currIndent][_key] = o;
                    _key = undefined;
                }
                _spaces= spaces;
                spaces += 2;
                for (i = i + 2, n = line.length; i < n; i++) {
                    if (line[i] === ' ') {
                        spaces++;
                    } else if (line[i] === '\t') {
                        spaces += tabSpaces - (spaces % tabSpaces);
                    }  else {
                        break;
                    }
                }
                if (line[i] === '-') {
                    throw new Error("Not yet implemented");
                } else {
                    break;
                }
            } 
            return spaces;
        }
        function getVal(str) {
            var v, match;
            ch = str[0];
            if (ch === '|') {
                v = processData(preserveNewLinesText(spaces));
            } else if (ch === '>') {
                v = linesText(spaces);
            } else {
                if (ch === '{' || ch === '[') {
                    v = JSON.parse(str);
                } else if (/^\d+(?:\.\d+)?$/.test(str)) {
                    v = parseFloat(str);
                } else if (str) {
                    if (annotation) {
                        switch(annotation) {
                            case "str": //string
                            case "string": //string
                                
                                break;
                            case "float": //    number
                                v = parseFloat(str);
                                break;
                            case "int": //    number
                                v = parseInt(str);
                                break;
                            case "bool": //    bool
                            case "boolean": //    bool
                                v = toBool(str);
                                break;
                            case "map": //    object(...) with attribute types determined per this table
                                
                                break;
                            case "seq": //    tuple(...) with element types determined per this table
                                
                                break;
                            case "null": //    The Terraform language null value
                                
                                break;
                            case "timestamp": //    string in RFC 3339 format
                                v = new Date(str);
                                break;
                            case "binary": //    string containing base64-encoded representation
                                v = new Base64(str);
                                break;
                        }
                    } else if (str.startsWith('%(') && processUrl) {
                        if (!/\)$/.test(str)) {
                            throw new Error("Incorrect url: " + str);
                        }
                        if (match = /^[^,]+/.exec(str.substring(1, str.length - 1))) {
                            if (typeof  processUrl === 'function') {
                                v = processUrl(match[0].trim(), str.substring(match[0].length));                                
                            } else {
                                v = new Url(match[0].trim(), str.substring(match[0].length));    
                            }
                        }
                    } else if (/[a-zA-Z]+:\/\//.test(str) && processUrl) {
                        v = typeof  processUrl === 'function' ?  processUrl(str) : new Url(str);
                    } else {
                        v = str;
                    }
                } else {
                    v = undefined;
                }
            }
            return v;
        }
        
        function getArray(str) {
            var arr = [], offs = 1;
            var i = 1, n = str.length, ch;
            while (i< n) {
                ch = str[i];
                if (ch === ']') {
                    arr.push(getVal(str.substring(offs, i).trim()));
                    i++;
                    break;
                } else if (ch === ',') {
                    arr.push(getVal(str.substring(offs, i).trim()));
                    i++;
                    offs = i;
                } else if (ch === '"' || ch === "'") {
                    throw new Error("Not yet supported");
                } else {
                    i++;
                }
            }
            return arr;
        }
        
        function processBracket(k, v, arr) {
            var o = {};
            k = getArray(k);
            v = getArray(v);
            if (k.length !== v.length) {
                throw new Error("Incorrect item");
            }
            k.forEach(function(x, i) {
                o[x] = v[i];
            });
            arr.push(o);
        }
        var sections;
        var refs = {}, match, ref;
        var ptr;
        var line, s, obj;
        var indent = {};
        var currIndent = 0, arr, right;
        var o, i, item, _key, offs, tokens;
        var levels = {}, indents = [], root = false, keys, txt;
        var lines = str.split(/(?:\n|\r\n?)+/), j = 0, n = lines.length, line, spaces, v, _spaces, oldSpaces;
        while (j < n) {
            line = lines[j];
            if (line === "picture: !!binary |") {
                console.log(line);
            }
            indent = skipIndent(line, indent);
            i = indent.index;
            if (line.startsWith("---")) {
                if (root !== false) {
                    (sections||(sections=[])).push(levels[root]);
                    root = false;
                    levels = {};
                } else {
                    sections = [];
                }
                j++;
            } else if (line.startsWith("...")) {
                //TODO
                j++;
            } else if (line[indent.spaces] !== '#') {
                if (root === false) root = indent.spaces;
                oldSpaces = indent.spaces;
                if ((spaces = arrayItem(indent.spaces))) {
                    s = split(line.substring(i).trim());
                    if (s.length === 2) {
                        right = s[1].trim();
                        splitRight();
                        Object.keys(levels).forEach(function(_k) {
                            if (parseFloat(_k) > spaces) {
                                delete levels[_k];
                            }
                        });
                        if (s[0][0] !== '[') {
                            levels[spaces] = v = {};
                            o.push(v);
                            o = v;
                        }
                        if (match = /^&([^\s#]+)\s*(?:#\s*(.*))?$/.exec(right)) {
                            if (refs[match[1]]) {
                                throw new Error("Too many references: " + match[1]);
                            }
                            ref = match[1];
                            _key = s[0];
                        } else if (match = /^\*([^\s#]+)\s*(?:#\s*(.*))?$/.exec(right)) {
                            o[s[0]] = refs[match[1]];
                        } else if (s[0][0] === '[') {
                            processBracket(s[0], s[1], o);
                        } else if (right) {
                            o[s[0]] = getVal(right);
                        }  else {
                            _key = s[0];
                        }
                        currIndent = spaces;
                    } else if (match = /^&([^\s#]+)\s*(?:#\s*(.*))?$/.exec(s[0])) {
                        if (refs[match[1]]) {
                            throw new Error("Too many references: " + match[1]);
                        }
                        ref = match[1];
                    } else if (match = /^\*([^\s#]+)\s*(?:#\s*(.*))?$/.exec(s[0])) {
                        o.push(refs[match[1]]);
                    } else {
                        o.push(getVal(s[0]));
                        currIndent = _spaces;
                    }
                    j++;
                } else if (line.startsWith("%[", i)) { //table block starter
                    //TODO
                    j++;
                } else if (line.startsWith("%image", i)) {
                    //TODO
                    j++;
                } else if (match = /^%(\d+)/.exec(line.substring(i))) { //Heading starter
                    i += 2;
                    tokens = line.substring(i).trim().split(/%#/);
                    chunks = [];
                    num = parseInt(match[1]);
                    tokens.forEach(function(tok, p) {
                        if (p) {
                            if (match = /[^\s]+/.exec(tok)) {
                                chunks.push(new Anchor(match[0]));
                                if (txt = tokens[p].substring(match[0].length).trim()) {
                                    chunks.push(new Chunk(txt));
                                }
                            } else {
                                
                            }
                        } else {
                            chunks.push(new Chunk(tokens[p]));
                        }
                    });
                    new Heading(num, chunks);
                    j++;
                } else if (line.startsWith("%", i)) { //text block starter
                    //TODO
                    j++;
                } else {
                    spaces = indent.spaces;
                    o = levels[spaces];
                    if (!o) {
                        o = levels[spaces] = line[indent.index] === '-' ? [] : {};
                        if (ref) {
                            refs[ref] = o;
                            ref = undefined;
                        }
                    } else if (isArray(o)) {
                        throw new Error("Object expected");
                    }
                    if (currIndent < spaces) {
                        if (_key) {
                            (levels[currIndent]||(levels[currIndent] = {}))[_key] = o;
                            if (ref) {
                                refs[ref] = o;
                                ref = undefined;
                            }
                            _key = undefined;
                        }
                    } else if (currIndent > spaces) {
                        if (_key) {
                            (levels[currIndent]||(levels[currIndent] = {}))[_key] = _key = undefined;
                        }
                        Object.keys(levels).forEach(function(lvl) {
                            if (parseFloat(lvl) > spaces) {
                                delete levels[lvl];
                            }
                        });
                    } else {
                        if (_key) {
                            throw new Error("");
                        }
                    }
                    s = split(line.substring(i).trim());
                    if (s.length === 2) {
                        right = s[1].trim();
                        splitRight();
                        if (match = /^&([^\s#]+)\s*(?:#\s*(.*))?$/.exec(right)) {
                            if (refs[match[1]]) {
                                throw new Error("Too many references: " + match[1]);
                            }
                            ref = match[1];
                            _key = s[0];
                            j++;
                        } else if (match = /^\*([^\s#]+)\s*(?:#\s*(.*))?$/.exec(right)) {
                            o[s[0]] = refs[match[1]];
                            j++;
                        } else if (right) {
                            ch = right[0];
                            if (ch === '|') {
                                o[s[0]] = processData(preserveNewLinesText(spaces));
                            } else if (ch === '>') {
                                o[s[0]] = processData(linesText(spaces));
                            } else {
                                if (ch === '{') { 
                                    o[s[0]] = JSON.parse(right);
                                } else if (ch === '[') {
                                    o[s[0]] = getArray(right);
                                    if (right.length < i && !/^#/.test(right.substring(i).trim())) {
                                        throw new Error("Incorrect line");
                                    }
                                } else {
                                    o[s[0]] = getVal(right);
                                }
                                j++;
                            }
                            _key = undefined;
                        } else {
                            _key = s[0];
                            j++;
                        }
                    } else {
                        throw new Error("Character ':' expected");
                    }
                    currIndent = spaces;
                }
            } else {
                j++;
            }            
        }
        if (sections) {
            if (root !== false) sections.push(levels[root]);
            return sections;
        }
        return levels[root];
    };


    
    return YAML;

});
