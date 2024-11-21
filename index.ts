
import { IInputs, IOutputs } from "./generated/ManifestTypes";
import axios from 'axios';

export class LineD1 implements ComponentFramework.StandardControl<IInputs, IOutputs> {

    private _value: string;
    private _result: string;
    private _notifyOutputChanged: () => void;
    private inputElement: HTMLInputElement;
    private _container: HTMLDivElement;
    private _context: ComponentFramework.Context<IInputs>;
    private _refreshData: EventListenerOrEventListenerObject;
    private eventWrite: EventListenerOrEventListenerObject;
    private selectBtn : HTMLButtonElement;
    private connected = false;

    public refreshData(evt: Event): void {
        this._value = this.inputElement.value as string;
        this._notifyOutputChanged();
    }

    public writeSerial() {
      axios.post(`http://localhost:3000/write`, { "text": this._value })
      .then(function (response) {
        console.log('Write Status:', response.data.status)
      })
      .catch(function (error) {
        console.error('Error writing data:', error)
      });
    }
    
    /**
     * Empty constructor.
     */
    constructor()
    {

    }

    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
     */
    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement): void
    {
        // Add control initialization code
        this._context = context;
        this._container = document.createElement("div");
        this._notifyOutputChanged = notifyOutputChanged;
        this._refreshData = this.refreshData.bind(this);

        // creating HTML elements for the input type range and binding it to the function which 
        // refreshes the control data
        this.inputElement = document.createElement("input");
        this.inputElement.setAttribute("type", "text");
        this.inputElement.addEventListener("input", this._refreshData);

        this.eventWrite = this.eventWriteData.bind(this);

        this.selectBtn = document.createElement("button");
        this.selectBtn.innerText= "Connect";
        this.selectBtn.addEventListener("click", this.eventWrite);
        
        // retrieving the latest value from the control and setting it to the HTMl elements.
        this._value = context.parameters.sampleProperty.raw!;
        this.inputElement.setAttribute(
            "value",
            context.parameters.sampleProperty.formatted
            ? context.parameters.sampleProperty.formatted
            : ""
            );

         // appending the HTML elements to the control's HTML container element.
         this._container.appendChild(this.inputElement);
         this._container.appendChild(this.selectBtn);
         container.appendChild(this._container);

         this.fetchSerial();
    }

        // Function to make an API request
        async fetchSerial() {
          try {
              const response = await axios.get('http://localhost:3000/open', {
                  headers: {
                  'Content-Type': 'application/json'
                  }
              });
              console.log('Data:', response.data);
          } catch (error) {
              console.error('Error fetching data:', error);
          }
      }

    private eventWriteData(event: Event): void {
      this.writeSerial();
    }

    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    public updateView(context: ComponentFramework.Context<IInputs>): void {
        // Add code to update control view
        // storing the latest context from the control.
        this._value = context.parameters.sampleProperty.raw!;
        this._context = context;
        this.inputElement.setAttribute(
           "value",
           context.parameters.sampleProperty.formatted
           ? context.parameters.sampleProperty.formatted
           : ""
        );
     }

    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as "bound" or "output"
     */
    public getOutputs(): IOutputs {
        return {
            sampleProperty: this._value,
        };
     }

    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy(): void {
        // Add code to cleanup control if necessary
        this.inputElement.removeEventListener("input", this._refreshData);
        this.selectBtn.removeEventListener("click", this.eventWrite);
    }
}
