function ViewModel() {
    var self = this;
    self.uri = 'http://localhost:4000/measures';
    self.measures = ko.observableArray();
    self.values_uri_template = null;

    self.ajax = function(uri, method, data) {
        var request = {
            url: uri,
            type: method,
            // accepts: accept,
            contentType: "application/vnd.api+json",
            cache: false,
            data: JSON.stringify(data),
            // dataType: 'json',
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(textStatus + "\n" + errorThrown + "\n\n" +
                            jqXHR.status + " " + jqXHR.statusText + "\n" +
                            jqXHR.getAllResponseHeaders() + "\n" +
                            jqXHR.responseText);
            }
        };
        return $.ajax(request);
    }

    self.ajax(self.uri, 'GET').done(function(data) {
        self.measure_values_uri = function(measure) {
            return data.links['measures.values'].href.replace(
                "{measures.id}", measure.id())
        }

        _.forEach(data.measures, function(measure) {
            value = _.find(data.linked.values, function (value) {
                return _.has(measure, "links") &&
                    _.has(measure.links, "current_value") &&
                    measure.links.current_value == value.id
            });
            if (value) {
                current_timestamp = value.timestamp;
                current_value = value.value;
            } else {
                current_timestamp = null;
                current_value = null;
            }

            measure = {
                id: ko.observable(measure.id),
                name: ko.observable(measure.name),
                type: ko.observable(measure.type),
                current_timestamp: ko.observable(current_timestamp),
                current_value: ko.observable(current_value),
            };
            measure.updated = ko.computed(function() {
                ts = measure.current_timestamp()
                if (ts) return moment(new Date(ts)).fromNow();
                else return "never";
            });
            measure.is_active = ko.computed(function() {
                return measure.type() == "duration" &&
                    measure.current_value() == true;
            });
            self.measures.push(measure);
        });
    });

    self.doMeasure = function(measure, event) {
        switch(measure.type()) {
        case "event":
            value = 1;
            break;
        case "duration":
            value = !measure.current_value();
            break;
        }
        data = {"values": [{"value": value,
                            "timestamp": (new Date()).toISOString()}]};
        // TODO handle error
        self.ajax(self.measure_values_uri(measure), 'POST', data).done(
            function(data) {
                measure.current_timestamp(data.values[0].timestamp);
                measure.current_value(data.values[0].value);
            }
        );
    }
    self.beginAdd = function() {
        console.log("beginAdd");
    }
}
ko.applyBindings(new ViewModel(), $('#main')[0]);
