import { React } from "jimu-core";
import { AllWidgetSettingProps } from "jimu-for-builder";
import { MapWidgetSelector } from 'jimu-ui/advanced/setting-components';

const Setting = (props: AllWidgetSettingProps<any>) => {

    // Cuando cambio el seleccionable, guardo en props el valor del id y useMapWidgetIds
    const onMapChange = (useMapWidgetIds: string[]) => {
        props.onSettingChange({
            id: props.id,
            useMapWidgetIds: useMapWidgetIds
        });
    }
    
    return (
        <div className="widget-setting-demo">
            This is your starter widget setting area!
            <MapWidgetSelector
                onSelect={onMapChange}
                useMapWidgetIds={props.useMapWidgetIds}
            />
        </div>
    );
};

export default Setting;
