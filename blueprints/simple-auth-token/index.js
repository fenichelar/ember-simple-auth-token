module.exports = {
  normalizeEntityName: function() {
  },

  afterInstall: function() {
    return this.addBowerPackageToProject('ember-simple-auth');
  }
};
