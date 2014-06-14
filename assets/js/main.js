!function(){

	function initHelpers(){
		Handlebars.registerHelper('parseEvent', function(event, headers, options){
			var ret = '';
			_.forEach(headers, function(header){
				ret += options.fn(event[header]);
			});
			return ret;
		});
	}

	function parseTemplates(){
		var templates = {};
		$('script[type="script/x-handlebars-template"]').each(function(){
			var el = $(this);
			var id = el.attr('id');
			var template = Handlebars.compile(el.html());
			if(el.data('partial') === true)
				Handlebars.registerPartial(id, template);
			else
				templates[id] = template;
		});
		return templates;
	}

	initHelpers();
	var templates = parseTemplates();
	
	var Events = Backbone.Model.extend({
		url : 'data/mayor_events.csv',
	
		sync: function(method, model, options) {
			var params = _.extend({
				type: 'GET',
				dataType: 'text',
				url: _.result(model, 'url'),
			}, options);
	 
			return Backbone.$.ajax(params);
		},

		parse : function(csv){
			var rows = csv.split('\n');
			// There was something wierd going on character wise with the headers
			// So the regex fixes this by filtering out non-letter characers
			var headers = _.map(rows.shift().split(','), function(header){
				return header.match(/\w+/)[0];
			});
			var events = _.map(rows, function(row){
				var vals = row.split(',');
				return _.zipObject(headers, vals);
			});
			return {
				events : events,
				headers : headers
			};
		}
	});

	var EventsTable = Backbone.View.extend({
		template : templates.events,

		initialize : function(){
			this.listenTo(this.model, 'change', this.render);
		},

		render : function(){
			this.$el.html(this.template(this.model.toJSON()));
		}
	});

	var Router = window.Router = Backbone.Router.extend({
		initialize : function(){
			this.events = new Events();
			this.eventsTable = new EventsTable({
				model : this.events
			});
			this.eventsTable.$el.appendTo(Backbone.$('#events_table_container'));
			this.events.fetch();
		}

	});
	
}();
