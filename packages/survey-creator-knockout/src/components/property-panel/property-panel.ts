import { PropertyGridViewModel } from "@survey/creator";
import * as ko from "knockout";
import { Base, ImplementorBase, property, SurveyModel } from "survey-knockout";
const template = require("./property-panel.html");

ko.components.register("svc-property-panel", {
  viewModel: {
    createViewModel: (params: any) => {
      const model = new PropertyGridViewModel(params.model, params.title);
      new ImplementorBase(model);
      return model;
    },
  },
  template: template,
});
