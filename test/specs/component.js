describe('Component', function () {
  'use strict';
  var Component = Backbone.React.Component.extend({
    render: function () {
      return React.DOM.div({}, this.props.test);
    }
  });
  var component, model1, model2, collection1, collection2;
  beforeEach(function () {
    model1 = new Backbone.Model({test: 'A'});
    model2 = new Backbone.Model({otherTest: 'B'});
    collection1 = new Backbone.Collection([model1, model2]);
    collection2 = new Backbone.Collection([model2, model1]);
  });
  afterEach(function () {
    if (component) component.remove();
    component = void 0;
    model1.stopListening();
    model2.stopListening();
    collection1.stopListening();
    collection2.stopListening();
  });
  it('mounts and renders', function () {
    component = new Component({
      model: model1,
      el: document.createElement('div')
    }).mount();
    expect(component.el.childNodes.length).toEqual(1);
    expect(component.el.textContent).toEqual('A');
  });
  it('unmounts', function () {
    component = new Component({el: document.createElement('div')});
    component.mount();
    component.unmount();
    expect(component.el.childNodes.length).toEqual(0);
  });
  it('gets the model(s)', function () {
    component = new Component({model: model1});
    expect(component.getModel()).toEqual(model1);
  });
  it('gets the collection(s)', function () {
    component = new Component({collection: collection1});
    expect(component.getCollection()).toEqual(collection1);
  });
  it('gets the owner', function () {
    component = new Component({el: document.createElement('div')});
    component.mount();
    expect(component.getOwner()).toEqual(component);
    var NewComponent = Component.extend({
      render: function () {
        return SubComponent();
      }
    });
    var checkOwnerSpy = jasmine.createSpy();
    var SubComponent = Component.extend({
      checkOwner: function () {
        checkOwnerSpy();
        expect(this.getOwner()).toEqual(newComponent);
      },
      render: function () {
        this.checkOwner();
        return React.DOM.div();
      }
    });
    var newComponent = new NewComponent({el: document.createElement('div')});
    newComponent.mount();
    expect(checkOwnerSpy).toHaveBeenCalled();
    newComponent.remove();
  });
  it('is clonable', function () {
    component = new Component({model: model1});
    var clone = component.clone({model: model2});
    expect(clone).toBeDefined();
    expect(clone.getModel()).toEqual(model2);
    clone.remove();
  });
  it('allows extending', function () {
    var NewComponent = Component.extend({
      test: function () {}
    });
    expect(NewComponent).toBeDefined();
    var newComponent = new NewComponent({el: document.createElement('div')}).mount();
    expect(newComponent.test).toBeDefined();
  });
  it('binds to a model', function () {
    component = new Component({model: model1});
    expect(component.props.test).toEqual('A');
    model1.set('test', 'B');
    expect(component.props.test).toEqual('B');
  });
  it('binds to multiple models', function () {
    component = new Component({
      model: {
        model1: model1,
        model2: model2
      }
    });
    expect(component.props.model1.test).toEqual('A');
    expect(component.props.model2.otherTest).toEqual('B');
  });
  it('binds to a collection', function () {
    component = new Component({
      collection: collection1
    });
    expect(component.props.collection[0].test).toEqual('A');
    expect(component.props.collection[1].otherTest).toEqual('B');
    collection1.add({test: 'C'});
    expect(component.props.collection[2].test).toEqual('C');
  });
  it('binds to multiple collections', function () {
    component = new Component({
      collection: {
        firstCollection: collection1,
        secondCollection: collection2
      }
    });
    expect(component.props.firstCollection[0].test).toEqual('A');
    expect(component.props.firstCollection[1].otherTest).toEqual('B');
    expect(component.props.secondCollection[0].otherTest).toEqual('B');
    expect(component.props.secondCollection[1].test).toEqual('A');
    collection1.add({test: 'C'});
    expect(component.props.firstCollection[2].test).toEqual('C');
    collection2.add({otherTest: 'C'});
    expect(component.props.secondCollection[2].otherTest).toEqual('C');
  });
});