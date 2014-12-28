// "fake" DOMParser for PixiJS
window.DOMParser = function() {};

window.DOMParser.prototype.parseFromString = function(str, type) {
  type = type.toLowerCase();
  if(type !== 'text/xml' && type !== 'text/html') {
    return undefined;
  }

  // based on https://github.com/Constellation/domlike
  str = str.replace(/(?:<!--[^>]*-->|\n)/g, '');
  var nodeParent = node = result = document.createElement(),
    nodes = str.match(/(?:<([\/]?)([^>\s\/]*)\s*([^>]*)>|[^<>]*)/g);

  nodes.forEach(function(e, index, nodes) {
    var isTag = null;

    if(e.indexOf('<') !== 0) {
      isTag = 'text';
    } else {
      if(e.charAt(1) === '/') {
        isTag = 'closeTag';
      } else {
        if(e.indexOf('/>') > 0) {
          isTag = 'singleTag';
        } else {
          isTag = 'tag';
        }
      }
    }

    switch(isTag) {
      case 'text':
        e = e.replace(/(?:^\s+|\s+$)/g, '');
        if(e !== '') {
          node.setAttribute('innerHTML', e);
        }
        break;

      case 'singleTag':
      case 'tag':
        var element = document.createElement(e.match(/<\s*([^<>\s]+)/)[1]),
          attr = e.match(/([^>\s]+="[^>"]+")/g);
        if(attr !== null) {
          attr.forEach(function(e){
            var a = e.split('=');
            element.setAttribute(a[0], a[1].replace(/"/g, ''));
          });
        }
        node.appendChild(element);
        if(isTag === 'tag') {
          nodeParent = node;
          node = element;
        }
        break;

      case 'closeTag':
        node = nodeParent;
        break;

      default:
        break;
    }
  }, this);

  return result;
};

HTMLElement.prototype.getElementsByTagName = function(tagName) {
  var result = [];

  if(this.tagName.toLowerCase() == tagName.toLowerCase()) {
    result.push(this);
  }

  this.children.forEach(function(child) {
    result = result.concat(child.getElementsByTagName(tagName));
  });

  return result;
};
