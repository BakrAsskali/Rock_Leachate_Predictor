import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RockCharacteristics {
  ec_rock: number;
  ph_rock: number;
  corg_rock: number;
  ca_rock: number;
  k_rock: number;
  mg_rock: number;
  na_rock: number;
  sar_rock: number;
  sio2_rock: number;
  al2o3_rock: number;
  fe2o3_rock: number;
  tio2_rock: number;
  mno_rock: number;
  cao_rock: number;
  mgo_rock: number;
  na2o_rock: number;
  k2o_rock: number;
  so3_rock: number;
  p2o5_rock: number;
}

interface Event {
  type_event: string;
  event_quantity: number;
  acid: number;
  temp: number;
  timestep: number;
}

interface LeachatePrediction {
  timestep: number;
  volume_leachate: number;
  ec_leachate: number;
  ph_leachate: number;
  chloride_leachate: number;
  carbonate_leachate: number;
  sulfate_leachate: number;
  nitrate_leachate: number;
  phosphate_leachate: number;
  ca_leachate: number;
  fe_leachate: number;
  k_leachate: number;
  mg_leachate: number;
  mn_leachate: number;
  na_leachate: number;
  explanation: string[];
}

function predictLeachate(
  rock: RockCharacteristics,
  events: Event[],
  previousState: LeachatePrediction | null
): LeachatePrediction[] {
  const predictions: LeachatePrediction[] = [];
  let cumulativeState = previousState || null;

  for (const event of events) {
    const explanations: string[] = [];
    
    const baseVolume = event.event_quantity * 10;
    const acidFactor = event.acid > 0 ? 1 + (event.acid / 100) : 1;
    const tempFactor = 1 + ((event.temp - 20) / 100);
    
    const volumeLeachate = baseVolume * tempFactor;
    
    let phLeachate = rock.ph_rock;
    if (event.acid > 0) {
      phLeachate = Math.max(2.0, rock.ph_rock - (event.acid / 10));
      explanations.push(`Acid addition (${event.acid}%) significantly lowered pH from ${rock.ph_rock.toFixed(1)} to ${phLeachate.toFixed(1)}`);
    } else if (cumulativeState) {
      phLeachate = cumulativeState.ph_leachate + 0.1;
    }
    
    const ecBase = rock.ec_rock * 100;
    const ecLeachate = (ecBase * acidFactor * tempFactor) / volumeLeachate;
    
    if (event.temp > 25) {
      explanations.push(`Elevated temperature (${event.temp}°C) increased dissolution rates by ${((tempFactor - 1) * 100).toFixed(0)}%`);
    }
    
    const caLeachate = (rock.ca_rock * event.event_quantity * acidFactor * tempFactor) / 10;
    const mgLeachate = (rock.mg_rock * event.event_quantity * acidFactor * tempFactor) / 10;
    const naLeachate = (rock.na_rock * event.event_quantity * tempFactor) / 10;
    const kLeachate = (rock.k_rock * event.event_quantity * tempFactor) / 10;
    
    if (caLeachate > 50) {
      explanations.push(`High calcium leaching (${caLeachate.toFixed(1)} mg/L) due to ${rock.cao_rock > 20 ? 'high CaO content in rock' : 'acidic conditions'}`);
    }
    
    const feLeachate = (rock.fe2o3_rock * event.event_quantity * acidFactor * tempFactor) / 20;
    const mnLeachate = (rock.mno_rock * event.event_quantity * acidFactor) / 5;
    
    if (event.acid > 5) {
      explanations.push(`Acidic conditions enhanced metal mobilization, particularly Fe (${feLeachate.toFixed(2)} mg/L) and Mn (${mnLeachate.toFixed(2)} mg/L)`);
    }
    
    const sulfateBase = rock.so3_rock * event.event_quantity * tempFactor;
    const sulfateLeachate = sulfateBase * (event.acid > 0 ? 2 : 1);
    
    const carbonateLeachate = rock.cao_rock > 20 
      ? Math.max(0, (rock.cao_rock * 2) - (event.acid * 10))
      : 5;
    
    if (rock.cao_rock > 20 && event.acid > 0) {
      explanations.push(`Carbonate minerals (CaO: ${rock.cao_rock}%) neutralized acid, producing CO2 and reducing carbonate concentration`);
    }
    
    const phosphateLeachate = (rock.p2o5_rock * event.event_quantity) / 5;
    const chlorideLeachate = 20 + (event.event_quantity * 2);
    const nitrateLeachate = event.type_event.toLowerCase().includes('fertilizer') ? 50 : 10;
    
    if (event.type_event.toLowerCase().includes('rain') || event.type_event.toLowerCase().includes('water')) {
      explanations.push('Water/rain event: dilution effect observed across all ionic species');
    }
    
    if (cumulativeState) {
      explanations.push(`Sequential leaching: accumulation effects from ${events.indexOf(event) + 1} events observed`);
    }
    
    const prediction: LeachatePrediction = {
      timestep: event.timestep,
      volume_leachate: parseFloat(volumeLeachate.toFixed(2)),
      ec_leachate: parseFloat(ecLeachate.toFixed(2)),
      ph_leachate: parseFloat(phLeachate.toFixed(2)),
      chloride_leachate: parseFloat(chlorideLeachate.toFixed(2)),
      carbonate_leachate: parseFloat(carbonateLeachate.toFixed(2)),
      sulfate_leachate: parseFloat(sulfateLeachate.toFixed(2)),
      nitrate_leachate: parseFloat(nitrateLeachate.toFixed(2)),
      phosphate_leachate: parseFloat(phosphateLeachate.toFixed(2)),
      ca_leachate: parseFloat(caLeachate.toFixed(2)),
      fe_leachate: parseFloat(feLeachate.toFixed(3)),
      k_leachate: parseFloat(kLeachate.toFixed(2)),
      mg_leachate: parseFloat(mgLeachate.toFixed(2)),
      mn_leachate: parseFloat(mnLeachate.toFixed(3)),
      na_leachate: parseFloat(naLeachate.toFixed(2)),
      explanation: explanations
    };
    
    predictions.push(prediction);
    cumulativeState = prediction;
  }
  
  return predictions;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { rock, events } = await req.json();

    if (!rock || !events || !Array.isArray(events)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request. Provide rock characteristics and events array.' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const predictions = predictLeachate(rock, events, null);

    return new Response(
      JSON.stringify({ predictions }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});