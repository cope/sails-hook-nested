const _ = require('lodash');
const {Validator, Rule} = require('@cesium133/forgjs');

const hasPlainObject = (o) => !!_.findKey(o, _.isPlainObject);
const forgify = (o) => {
	let keys = _.keys(o);
	for (let k of keys) {
		let v = o[k];
		if (_.isPlainObject(v)) {
			if (hasPlainObject(v)) {
				if ('array' === v.type) o[k] = new Rule(forgify(v));
				else o[k] = new Validator(forgify(v));
			} else {
				if (v.type) o[k] = new Rule(v);
				else o[k] = new Validator(v);
			}
		} else {
			if ('boolean' === v) o[k] = new Rule(v);
		}
	}
	o = _.pick(o, keys);
	return o;
};

const carryOn = (values, proceed, previous) => _.isFunction(previous) ? previous(values, proceed) : proceed();

const validateNested = (rules, values) => {
	let errors = [];
	let keys = _.keys(values);
	_.each(keys, (key) => {
		let rule = rules[key];
		let value = values[key];
		if (rule && value && !rule.test(value)) errors.push('Failed validation for ' + key + '.');
	});
	return errors;
};

const validate = (model, values, proceed, previous) => {
	let rules = model.nestedValidations;
	let errors = validateNested(rules, values);
	if (!_.isEmpty(errors)) return proceed(_.join(errors, ', '));
	return carryOn(values, proceed, previous);
};

module.exports = (sails) => {
	return {
		defaults: {},

		initialize: function (done) {
			sails.after(['hook:sockets:loaded'], function () {
				_.each(sails.models, (model) => {
					if (!model.globalId || !model.nested) return;

					model.nestedValidations = forgify(model.nested);
					delete model.nested;

					let previousBeforeUpdate = model.beforeUpdate;
					model.beforeUpdate = (values, proceed) => validate(model, values, proceed, previousBeforeUpdate);

					let previousBeforeCreate = model.beforeCreate;
					model.beforeCreate = (values, proceed) => validate(model, values, proceed, previousBeforeCreate);

					// TODO: add beforeBulkUpdate override, see http://docs.sequelizejs.com/manual/tutorial/hooks.html#model-hooks
					// let previousBeforeBulkUpdate = model.beforeBulkUpdate;
					// model.beforeBulkUpdate = (options) => {};

					// TODO: add beforeBulkCreate override, see http://docs.sequelizejs.com/manual/tutorial/hooks.html#model-hooks
					// let previousBeforeBulkCreate = model.beforeBulkCreate;
					// model.beforeBulkCreate = (instances, options) => {};
				});

				done();
			});
		}
	}
};
