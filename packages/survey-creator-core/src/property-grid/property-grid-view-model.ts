import { Base, SurveyModel, property, PopupModel, Action } from "survey-core";
import { PropertyGridModel } from "./index";
import { SelectionHistory } from "../selection-history";
import { SurveyHelper } from "../survey-helper";
import { ObjectSelectorModel } from "./object-selector";
import { CreatorBase } from "../creator-base";
import { settings } from "../settings";
import { getLocString } from "../editorLocalization";

export class PropertyGridViewModel<T extends SurveyModel> extends Base {
  public nextSelectionAction: Action;
  public prevSelectionAction: Action;
  public objectSelectionAction: Action;
  private selectorPopupModel: PopupModel;

  @property() hasPrev: boolean;
  @property() hasNext: boolean;
  @property() survey: SurveyModel;
  @property() selectedElementName: string;

  constructor(private propertyGridModel: PropertyGridModel, private creator: CreatorBase<T>) {
    super();
    this.selectedElementName = this.getTitle();
    this.propertyGridModel.objValueChangedCallback = () => {
      this.onSurveyChanged();
    };
    this.propertyGridModel.changedFromActionCallback = (obj: Base, propertyName: string) => {
      if (!!this.selectionController) {
        this.selectionController.selectFromAction(obj, propertyName);
      }
    };
    this.initActions();

    this.creator.onPropertyChanged.add((sender, options) => {
      if (options.name === "sideBarLocation") {
        this.selectorPopupModel.horizontalPosition = this.creator.sideBarLocation == "right" ? "left" : "right";
      }
    });
    this.onSurveyChanged();
  }

  protected onPropertyValueChanged(name: string, oldValue: any, newValue: any) {
    super.onPropertyValueChanged(name, oldValue, newValue);

    if (!!this.nextSelectionAction && name === "hasNext") {
      this.nextSelectionAction.enabled = this.hasNext;
    }
    if (!!this.prevSelectionAction && name === "hasPrev") {
      this.prevSelectionAction.enabled = this.hasPrev;
    }
  }

  private get selectionController(): SelectionHistory {
    return this.creator.selectionHistoryController;
  }

  private onSurveyChanged() {
    this.survey = this.propertyGridModel.survey;
    if (!!this.survey) {
      this.survey.onValueChanged.add((sender: SurveyModel, options: any) => {
        if (options.name == "name" || options.name == "title") {
          this.updateTitle();
        }
      });
    }
    this.updateTitle();
    if (this.selectionController) {
      this.hasPrev = this.selectionController.hasPrev;
      this.hasNext = this.selectionController.hasNext;
    }
  }
  private updateTitle() {
    this.selectedElementName = this.getTitle();
    this.objectSelectionAction.title = this.selectedElementName;
  }
  private getTitle(): string {
    var obj = this.propertyGridModel.obj;
    if (!obj) return "";
    var displayName = SurveyHelper.getObjectName(obj, this.propertyGridModel.options.showObjectTitles);
    return this.propertyGridModel.options.getObjectDisplayName(obj, "property-grid", displayName);
  }

  private initActions() {
    if (settings.propertyGrid.showNavigationButtons) {
      this.prevSelectionAction = new Action({
        id: "svd-grid-history-prev",
        iconName: "icon-prev",
        component: "sv-action-bar-item",
        title: getLocString("ed.prevSelected"),
        showTitle: false,
        enabled: this.hasPrev,
        action: () => {
          this.selectionController.prev();
        }
      });

      this.nextSelectionAction = new Action({
        id: "svd-grid-history-next",
        iconName: "icon-next",
        component: "sv-action-bar-item",
        title: getLocString("ed.nextSelected"),
        showTitle: false,
        enabled: this.hasNext,
        action: () => {
          this.selectionController.next();
        }
      });
    }

    const selectorModel = new ObjectSelectorModel(
      (obj: Base, reason: string, displayName: string) => {
        return this.propertyGridModel.options.getObjectDisplayName(obj, reason, displayName);
      }
    );
    this.selectorPopupModel = new PopupModel(
      "svc-object-selector",
      { model: selectorModel },
      "bottom",
      this.creator.sideBarLocation == "right" ? "left" : "right"
    );

    this.objectSelectionAction = new Action({
      id: "svd-grid-object-selector",
      title: this.selectedElementName,
      css: "sv-action--last sv-action-bar-item--secondary",
      iconName: "icon-more",
      component: "sv-action-bar-item-dropdown",
      action: () => {
        this.selectorPopupModel.displayMode = this.creator.isMobileView ? "overlay" : "popup";
        selectorModel.show(
          this.selectionController.creator.survey,
          this.propertyGridModel.obj,
          (obj: Base) => {
            this.selectionController.selectFromAction(obj, "name");
            this.selectorPopupModel.toggleVisibility();
          }
        );
        this.selectorPopupModel.toggleVisibility();
      },
      popupModel: this.selectorPopupModel
    });
  }
}