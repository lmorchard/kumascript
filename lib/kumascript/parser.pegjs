/*
 * PEG.js parser for macros in wiki documents.
 * see also: http://pegjs.majda.cz/documentation
 */
start = Document

Document = ( Text / Macro )+

Text = c:Chars+ {
    return {
        type: "TEXT",
        chars: c.join('')
    };
}

Chars = c:( SingleLeftBrace / SingleRightBrace /
            EscapedBraces / SingleBackslash /
            BoringChars ) { return c.join(''); }

/* This seems like a horrible pile of hacks, but works. */
SingleLeftBrace = "{" [^{]
SingleRightBrace = "}" [^}]
EscapedBraces = c:("\\{" / "\\}") { return [c[1]]; }
SingleBackslash = "\\" { return ["\\"]; }
BoringChars = [^{}\\]+

Macro = "{{" __ name:MacroName __ args:(Arguments / ArgumentsJSON)? __ "}}" { 
    return {
        type: 'MACRO',
        name: name.join(''),
        args: args || [],
        offset: offset
    };
}

/* Trying to be inclusive, but want to exclude params start and macro end */
MacroName = [^\(\} ]+

Arguments
  = "(" __ args:ArgumentList? __ ")" { return args; }

ArgumentsJSON
  = "(" json_args:[^)]+ ")" { return [JSON.parse(json_args.join(''))]; }

ArgumentList
  = head:Argument tail:(__ "," __ Argument)* {
        var result = [head];
        for (var i = 0; i < tail.length; i++) {
            result.push(tail[i][3]);
        }
        return result;
    }

Argument
  = c:( Number / DoubleArgumentChars / SingleArgumentChars )

Number = c:[\-.0-9]+ { return parseInt(c.join('')); }

DoubleArgumentChars
  = '"' c:DoubleArgumentChar+ '"' { return c.join(''); }

SingleArgumentChars
  = "'" c:SingleArgumentChar+ "'" { return c.join(''); }

DoubleArgumentChar 
  = [^"\\] / '\\"' { return '"'; }

SingleArgumentChar 
  = [^'\\] / "\\'" { return "'"; }

__ = whitespace*

whitespace = [ \t\n\r]
