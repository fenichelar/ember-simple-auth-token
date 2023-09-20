import DS from 'ember-data';
import TokenAuthorizerMixin from '@triptyk/ember-simple-auth-token/mixins/token-authorizer';

export default DS.RESTAdapter.extend(TokenAuthorizerMixin);
