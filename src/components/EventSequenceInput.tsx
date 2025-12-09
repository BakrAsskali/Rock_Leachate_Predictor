import { useState } from 'react';
import { Event } from '../lib/supabase';
import { Plus, Trash2, Calendar } from 'lucide-react';

interface EventSequenceInputProps {
  events: Event[];
  onEventsChange: (events: Event[]) => void;
}

export function EventSequenceInput({ events, onEventsChange }: EventSequenceInputProps) {
  const [newEvent, setNewEvent] = useState<Event>({
    type_event: 'Rain',
    event_quantity: 10,
    acid: 0,
    temp: 20,
    timestep: events.length + 1,
  });

  const eventTypes = [
    'Rain',
    'Irrigation',
    'Acid Rain',
    'Fertilizer Application',
    'Chemical Treatment',
    'Natural Weathering',
  ];

  const addEvent = () => {
    onEventsChange([...events, { ...newEvent, timestep: events.length + 1 }]);
    setNewEvent({
      type_event: 'Rain',
      event_quantity: 10,
      acid: 0,
      temp: 20,
      timestep: events.length + 2,
    });
  };

  const removeEvent = (index: number) => {
    const updated = events.filter((_, i) => i !== index);
    const reindexed = updated.map((e, i) => ({ ...e, timestep: i + 1 }));
    onEventsChange(reindexed);
  };

  const updateNewEvent = (field: keyof Event, value: string | number) => {
    setNewEvent(prev => ({
      ...prev,
      [field]: typeof value === 'string' && field !== 'type_event' ? parseFloat(value as string) || 0 : value,
    }));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-50 rounded-lg">
          <Calendar className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Event Sequence</h2>
          <p className="text-sm text-gray-500">Define the sequence of events to simulate</p>
        </div>
      </div>

      <div className="space-y-4">
        {events.length > 0 && (
          <div className="space-y-2 mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Current Events ({events.length})</h3>
            {events.map((event, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-semibold">
                  {event.timestep}
                </div>
                <div className="flex-1 grid grid-cols-5 gap-3 text-sm">
                  <div>
                    <div className="text-gray-500 text-xs">Type</div>
                    <div className="font-medium text-gray-900">{event.type_event}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs">Quantity</div>
                    <div className="font-medium text-gray-900">{event.event_quantity}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs">Acid %</div>
                    <div className="font-medium text-gray-900">{event.acid}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs">Temp (°C)</div>
                    <div className="font-medium text-gray-900">{event.temp}</div>
                  </div>
                </div>
                <button
                  onClick={() => removeEvent(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="border-t pt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Add New Event</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Type
              </label>
              <select
                value={newEvent.type_event}
                onChange={(e) => updateNewEvent('type_event', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {eventTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                step="0.1"
                value={newEvent.event_quantity}
                onChange={(e) => updateNewEvent('event_quantity', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Acid (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={newEvent.acid}
                onChange={(e) => updateNewEvent('acid', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temp (°C)
              </label>
              <input
                type="number"
                step="0.1"
                value={newEvent.temp}
                onChange={(e) => updateNewEvent('temp', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={addEvent}
                className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Event
              </button>
            </div>
          </div>
        </div>

        {events.length === 0 && (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            No events added yet. Add your first event above to start building the sequence.
          </div>
        )}
      </div>
    </div>
  );
}
