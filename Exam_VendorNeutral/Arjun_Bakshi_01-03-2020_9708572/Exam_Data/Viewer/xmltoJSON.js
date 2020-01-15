// Converts XML to JSON
// from: http://coursesweb.net/javascript/convert-xml-json-javascript_s2
function XMLtoJSON() {
    var me = this; // stores the object instance
    // gets the content of an xml file and returns it in
    me.fromFile = function (xml, rstr) {
        // Creates an instantce of XMLHttpRequest object
        var xhttp = (window.XMLHttpRequest) ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
        // sets and sends the request for calling "xml"
        xhttp.open("GET", xml, false);
        xhttp.send(undefined);
        // gets the JSON string
        var jsonStr = jsontoStr(setJsonObj(xhttp.responseXML));
        // sets and returns the JSON object, if "rstr" undefined (not passed), else, returns JSON string
        return (typeof (rstr) === 'undefined') ? JSON.parse(jsonStr) : jsonStr;
    };
    // returns XML DOM from string with xml content
    me.fromStr = function (xml, rstr) {
        // for non IE browsers
        if (window.DOMParser) {
            var getxml = new DOMParser();
            var xmlDoc = getxml.parseFromString(xml, "text/xml");
        }
        else {
            // for Internet Explorer
            xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
            xmlDoc.async = "false";
        }
        // gets the JSON string
        var jsonStr = jsontoStr(setJsonObj(xmlDoc));
        // sets and returns the JSON object, if "rstr" undefined (not passed), else, returns JSON string
        return (typeof (rstr) === 'undefined') ? JSON.parse(jsonStr) : jsonStr;
    };
    // receives XML DOM object, returns converted JSON object
    var setJsonObj = function (xml) {
        var jsObj = {};
        if (xml.nodeType === 1) {
            if (xml.attributes.length > 0) {
                jsObj["@attributes"] = {};
                for (var j = 0; j < xml.attributes.length; j++) {
                    var attribute = xml.attributes.item(j);
                    jsObj["@attributes"][attribute.nodeName] = attribute.value;
                }
            }
        }
        else if (xml.nodeType === 3) {
            jsObj = xml.nodeValue;
        }
        if (xml.hasChildNodes()) {
            for (var i = 0; i < xml.childNodes.length; i++) {
                var item = xml.childNodes.item(i);
                var nodeName = item.nodeName;
                if (typeof (jsObj[nodeName]) === "undefined") {
                    jsObj[nodeName] = setJsonObj(item);
                }
                else {
                    if (typeof (jsObj[nodeName].push) === "undefined") {
                        var old = jsObj[nodeName];
                        jsObj[nodeName] = [];
                        jsObj[nodeName].push(old);
                    }
                    jsObj[nodeName].push(setJsonObj(item));
                }
            }
        }
        return jsObj;
    };
    // converts JSON object to string (human readablle).
    // Removes '\t\r\n', rows with multiples '""', multiple empty rows, '  "",', and "  ",; replace empty [] with ""
    var jsontoStr = function (jsObj) {
        var str1 = JSON.stringify(jsObj, undefined, 2);
        var str2 = str1.replace(/(\\t|\\r|\\n)/g, '');
        var str3 = str2.replace(/"",[\n\t\r\s]+""[,]*/g, '');
        var str4 = str3.replace(/(\n[\t\s\r]*\n)/g, '');
        var rejsn = str4.replace(/\[[\t\s]*\]/g, '""');
        return (rejsn.indexOf('"parsererror": {') === -1) ? rejsn : 'Invalid XML format';
    };
}
;
// creates object instantce of XMLtoJSON
var xml2json = new XMLtoJSON();
// tslint:enable
//# sourceMappingURL=xmltoJSON.js.map