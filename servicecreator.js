function createMultiplierService(execlib, ParentService, leveldblib) {
  'use strict';

  var q = execlib.lib.q;
  
  var execSuite = execlib.execSuite,
    RemoteServiceListenerServiceMixin = execSuite.RemoteServiceListenerServiceMixin;

  function factoryCreator(parentFactory) {
    return {
      'service': require('./users/serviceusercreator')(execlib, parentFactory.get('service')),
      'user': require('./users/usercreator')(execlib, parentFactory.get('user')) 
    };
  }

  //This is the scenario #3 implementation
  //For different scenarios, check different git branches
  function MultiplierService(prophash) {
    ParentService.call(this, prophash);
    RemoteServiceListenerServiceMixin.call(this);
    this.findRemote(prophash.configsinkname, null, 'Config');
    this.state.data.listenFor('Config',this.onConfig.bind(this),true);
  }
  
  ParentService.inherit(MultiplierService, factoryCreator);
  RemoteServiceListenerServiceMixin.addMethods(MultiplierService);
  
  //This is the scenario #3 implementation
  //For different scenarios, check different git branches
  MultiplierService.prototype.__cleanUp = function() {
    RemoteServiceListenerServiceMixin.prototype.destroy.call(this);
    ParentService.prototype.__cleanUp.call(this);
  };

  MultiplierService.prototype.onConfig = function(configsink){
    taskRegistry.run('queryLevelDB',{
      queryMethodName: 'query',
      sink: configsink,
      scanInitially: true,
      filter: {
        keys: {
          op: 'eq',
          field: null,
          value: 'multiplier'
        }
      },
      onPut: this.onMultiplierSet.bind(this),
      onDel: this.onMultiplierRemoved.bind(this)
    });
  };

  //This is the scenario #3 implementation
  //For different scenarios, check different git branches
  MultiplierService.prototype.multiply = execSuite.dependentServiceMethod([],['multiplier'],function(multiplier, number, defer){
    defer.resolve(multiplier * number);
  });

  //This is the scenario #3 implementation
  //For different scenarios, check different git branches
  MultiplierService.prototype.onMultiplierSet = function(keyvalarray){
    var key = keyvalarray[0], val = keyvalarray[1];
    this.state.set(key,val);
  };

  //This is the scenario #3 implementation
  //For different scenarios, check different git branches
  MultiplierService.prototype.onMultiplierRemoved = function(key){
    this.state.remove(key);
  };

  MultiplierService.prototype.propertyHashDescriptor = {
    configsinkname: {
      type: ['string', 'array']
    }
  };
  
  return MultiplierService;
}

module.exports = createMultiplierService;
