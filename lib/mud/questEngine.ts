// lib/mud/questEngine.ts
// TUNNELCORE MUD — Quest Engine
// Quest definitions, objective tracking, rewards.

import type {
  Quest, QuestObjective, QuestReward,
  MudCharacter, MudWorldState,
} from './types';
import { saveWorld, loadWorld, updateNPCRelation, getNPCRelation } from './persistence';
import { addXP } from './character';
import { createItem } from './items';

// ── Quest Registry ──────────────────────────────────────────────────────────

export const QUEST_REGISTRY: Record<string, Quest> = {
  q001_lost_subject: {
    id: 'q001_lost_subject',
    title: 'THE LOST SUBJECT',
    giver: 'doss',
    tier: 1,
    type: 'MULTI',
    description: `a new test subject was dumped in the tunnels by helixion three days ago. retrieval team will come for them. find the subject before they do.`,
    objectives: [
      { id: 'obj_talk_doss', description: 'Talk to Doss about the missing subject', type: 'talk_to', target: 'doss', current: 0, required: 1, completed: false },
      { id: 'obj_search_north', description: 'Search the North Channel', type: 'go_to', target: 'z08_r04', current: 0, required: 1, completed: false },
      { id: 'obj_find_subject', description: 'Find the test subject', type: 'examine', target: 'subject_trail', current: 0, required: 1, completed: false },
      { id: 'obj_return', description: 'Return to Doss', type: 'talk_to', target: 'doss', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 100, creds: 30, items: ['stim_pack', 'stim_pack'] },
    repeatable: false,
    prerequisites: [],
    levelRequirement: 1,
  },
  q002_mara_scrap: {
    id: 'q002_mara_scrap',
    title: 'SCRAP RUN',
    giver: 'mara',
    tier: 1,
    type: 'FETCH',
    description: `mara needs drone components. the patrol drones in the east passage drop them. bring her 2.`,
    objectives: [
      { id: 'obj_get_drone', description: 'Collect 2 drone components', type: 'collect', target: 'drone_components', current: 0, required: 2, completed: false },
      { id: 'obj_deliver', description: 'Deliver to Mara', type: 'deliver', target: 'mara', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 75, creds: 20 },
    repeatable: true,
    prerequisites: [],
    levelRequirement: 1,
  },
  q003_cole_supplies: {
    id: 'q003_cole_supplies',
    title: 'MEDICAL SALVAGE',
    giver: 'cole',
    tier: 1,
    type: 'FETCH',
    description: `cole's running low on bio-samples for synthesizing antitox. the seep has creatures that carry what he needs.`,
    objectives: [
      { id: 'obj_get_bio', description: 'Collect 1 bio-sample from The Seep', type: 'collect', target: 'bio_sample', current: 0, required: 1, completed: false },
      { id: 'obj_return_cole', description: 'Return to Cole', type: 'deliver', target: 'cole', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 60, creds: 15, items: ['medkit'] },
    repeatable: true,
    prerequisites: [],
    levelRequirement: 1,
  },

  // ── Zone 09: Maintenance Tunnels Quests ──────────────────────────────────

  q004_renovation: {
    id: 'q004_renovation',
    title: 'THE RENOVATION',
    giver: 'moth',
    tier: 2,
    type: 'SABOTAGE',
    description: `moth's old building is getting helixion mesh-compliance hardware. the new cable runs will extend monitoring into the tunnel infrastructure beneath the building. they'll find her. disable the cables from below before they go active.`,
    objectives: [
      { id: 'obj_find_cables', description: 'find the new cable runs in the Ventilation Hub', type: 'go_to', target: 'z09_r03', current: 0, required: 1, completed: false },
      { id: 'obj_disable', description: 'disable the cable runs (TECH ≥ 6)', type: 'examine', target: 'renovation_cables', current: 0, required: 1, completed: false },
      { id: 'obj_return_moth', description: 'return to Moth', type: 'talk_to', target: 'moth', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 120, creds: 25 },
    repeatable: false,
    prerequisites: [],
    levelRequirement: 4,
  },
  q005_shipment: {
    id: 'q005_shipment',
    title: 'THE SHIPMENT',
    giver: 'fex',
    tier: 2,
    type: 'FETCH',
    description: `fex had a medical shipment coming through — supplies for the parish. her courier got intercepted by d9 in the sensor corridor. courier escaped. supplies didn't. the cargo is in a d9 seizure cache on the helixion side. cross the bulkhead. get it back.`,
    objectives: [
      { id: 'obj_cross_bulkhead', description: 'cross the bulkhead to the Helixion side', type: 'go_to', target: 'z09_r07', current: 0, required: 1, completed: false },
      { id: 'obj_find_cache', description: 'find the D9 seizure cache', type: 'examine', target: 'clean_corridor', current: 0, required: 1, completed: false },
      { id: 'obj_recover_supplies', description: 'recover the medical supplies', type: 'collect', target: 'seized_medical_supplies', current: 0, required: 1, completed: false },
      { id: 'obj_return_fex', description: 'return to Fex', type: 'deliver', target: 'fex', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 150, creds: 40 },
    repeatable: false,
    prerequisites: [],
    levelRequirement: 5,
  },
  q006_supply_line: {
    id: 'q006_supply_line',
    title: 'SUPPLY LINE',
    giver: 'fex',
    tier: 2,
    type: 'MULTI',
    description: `fex wants a permanent supply corridor from the maintenance tunnels to the iron bloom server farm. the route passes through the deep access shaft but the passage is blocked by collapse. clear it. open the road.`,
    objectives: [
      { id: 'obj_reach_shaft', description: 'reach the Deep Access Shaft', type: 'go_to', target: 'z09_r11', current: 0, required: 1, completed: false },
      { id: 'obj_clear_passage', description: 'clear the collapsed passage', type: 'examine', target: 'collapsed_passage', current: 0, required: 1, completed: false },
      { id: 'obj_return_fex_supply', description: 'return to Fex', type: 'talk_to', target: 'fex', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 125, creds: 30 },
    repeatable: false,
    prerequisites: ['q005_shipment'],
    levelRequirement: 5,
  },
  q007_maintenance_override: {
    id: 'q007_maintenance_override',
    title: 'MAINTENANCE OVERRIDE',
    giver: 'hale',
    tier: 3,
    type: 'MULTI',
    description: `hale knows something is wrong beneath the campus. he's been rerouted around a section that doesn't appear on his maintenance schedule. he'll give you utility override codes — trigger a distraction, access the staging area, and document what helixion is building down there. he needs to know. the not-knowing is worse than the danger.`,
    objectives: [
      { id: 'obj_talk_hale', description: 'get utility codes from Hale', type: 'talk_to', target: 'hale', current: 0, required: 1, completed: false },
      { id: 'obj_trigger_distraction', description: 'trigger distraction at the utility console', type: 'examine', target: 'utility_console', current: 0, required: 1, completed: false },
      { id: 'obj_access_staging', description: 'access the Staging Area', type: 'go_to', target: 'z09_r10', current: 0, required: 1, completed: false },
      { id: 'obj_document', description: 'document the containers', type: 'examine', target: 'hx7c_containers', current: 0, required: 1, completed: false },
      { id: 'obj_return_hale', description: 'return to Hale', type: 'talk_to', target: 'hale', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 250, creds: 60 },
    repeatable: false,
    prerequisites: [],
    levelRequirement: 7,
  },
  q008_the_exchange: {
    id: 'q008_the_exchange',
    title: 'THE EXCHANGE',
    giver: 'reed',
    tier: 3,
    type: 'INVESTIGATE',
    description: `reed has been monitoring the elevator for four months. every third delivery, the exchange rate is unequal — more substrate material comes up than helixion technology goes down. either helixion is extracting independently, or the substrate is giving more than it receives. ride the elevator to SL-3. document what happens at the bottom.`,
    objectives: [
      { id: 'obj_talk_reed', description: 'talk to Reed about the discrepancy', type: 'talk_to', target: 'reed', current: 0, required: 1, completed: false },
      { id: 'obj_ride_elevator', description: 'ride the elevator to SL-3', type: 'go_to', target: 'z14_r01', current: 0, required: 1, completed: false },
      { id: 'obj_document_exchange', description: 'document the Substrate exchange', type: 'examine', target: 'substrate_exchange', current: 0, required: 1, completed: false },
      { id: 'obj_return_reed', description: 'return to Reed', type: 'talk_to', target: 'reed', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 300, creds: 75, items: ['substrate_sample'] },
    repeatable: false,
    prerequisites: ['q007_maintenance_override'],
    levelRequirement: 8,
  },

  // ── Zone 04: The Fringe Quests ─────────────────────────────────────────────

  q009_first_steps: {
    id: 'q009_first_steps',
    title: 'FIRST STEPS',
    giver: 'lira',
    tier: 1,
    type: 'MULTI',
    description: `lira saved your life. now prove you can keep it. find a weapon, find food, find someone who knows this place.`,
    objectives: [
      { id: 'obj_weapon', description: 'Find a weapon', type: 'collect', target: 'scrap_weapon', current: 0, required: 1, completed: false },
      { id: 'obj_food', description: 'Find food', type: 'collect', target: 'nutrient_bar', current: 0, required: 1, completed: false },
      { id: 'obj_info', description: 'Talk to Oska in the Rubble Streets', type: 'talk_to', target: 'oska', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 80, creds: 15 },
    repeatable: false,
    prerequisites: [],
    levelRequirement: 1,
  },
  q010_the_name: {
    id: 'q010_the_name',
    title: 'THE NAME',
    giver: 'lira',
    tier: 2,
    type: 'INVESTIGATE',
    description: `more subjects dumped in the fringe. one per week. lira wants to know why. the trail leads through the deep ruins.`,
    objectives: [
      { id: 'obj_search_deep', description: 'Search the Deep Ruins', type: 'go_to', target: 'z04_r09', current: 0, required: 1, completed: false },
      { id: 'obj_examine_site', description: 'Examine the dumping site', type: 'examine', target: 'dumping_site', current: 0, required: 1, completed: false },
      { id: 'obj_return_lira', description: 'Return to Lira', type: 'talk_to', target: 'lira', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 150, creds: 35, items: ['chrysalis_evidence'] },
    repeatable: false,
    prerequisites: ['q009_first_steps'],
    levelRequirement: 3,
  },
  q011_dead_zones: {
    id: 'q011_dead_zones',
    title: 'DEAD ZONES',
    giver: 'oska',
    tier: 1,
    type: 'MULTI',
    description: `oska's maps have gaps. three areas too dangerous to survey alone. scout them and report back.`,
    objectives: [
      { id: 'obj_survey_underpass', description: 'Survey the Underpass', type: 'go_to', target: 'z04_r04', current: 0, required: 1, completed: false },
      { id: 'obj_survey_stalker', description: 'Survey Stalker Territory', type: 'go_to', target: 'z04_r10', current: 0, required: 1, completed: false },
      { id: 'obj_survey_clinic', description: 'Survey the Clinic', type: 'go_to', target: 'z04_r08', current: 0, required: 1, completed: false },
      { id: 'obj_return_oska', description: 'Return to Oska', type: 'talk_to', target: 'oska', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 100, creds: 20, items: ['fringe_complete_map'] },
    repeatable: false,
    prerequisites: [],
    levelRequirement: 2,
  },
  q012_old_plans: {
    id: 'q012_old_plans',
    title: 'THE OLD PLANS',
    giver: 'kai',
    tier: 2,
    type: 'FETCH',
    description: `kai's drainage blueprints were taken from his tower months ago. scavengers, probably. the plans reveal the full tunnel network.`,
    objectives: [
      { id: 'obj_search_cache', description: 'Search the Scavenger Cache', type: 'go_to', target: 'z04_r05', current: 0, required: 1, completed: false },
      { id: 'obj_find_blueprints', description: 'Find the blueprints', type: 'examine', target: 'stolen_blueprints', current: 0, required: 1, completed: false },
      { id: 'obj_return_kai', description: 'Return to Kai', type: 'talk_to', target: 'kai', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 175, creds: 30, items: ['drainage_blueprints'] },
    repeatable: false,
    prerequisites: [],
    levelRequirement: 3,
  },
  q013_verification: {
    id: 'q013_verification',
    title: 'VERIFICATION',
    giver: 'sable',
    tier: 2,
    type: 'MULTI',
    description: `sable guards the way to iron bloom. prove you belong. bring evidence of helixion wrongdoing, a referral from someone she trusts, or clear the stalker nest and bring proof.`,
    objectives: [
      { id: 'obj_get_evidence', description: 'Obtain Helixion evidence', type: 'collect', target: 'chrysalis_evidence', current: 0, required: 1, completed: false },
      { id: 'obj_present_sable', description: 'Present to Sable', type: 'talk_to', target: 'sable', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 200, creds: 50 },
    repeatable: false,
    prerequisites: [],
    levelRequirement: 4,
  },

  // ── Zone 03: Industrial District Quests ──────────────────────────────────

  q014_prove_it: {
    id: 'q014_prove_it',
    title: 'PROVE IT',
    giver: 'voss',
    tier: 2,
    type: 'ELIMINATE',
    description: `voss doesn't give anything for free. clear the automata floor in the dead factory. bring back a servo core. then we talk.`,
    objectives: [
      { id: 'obj_enter_automata', description: 'Enter the Automata Floor', type: 'go_to', target: 'z03_r08', current: 0, required: 1, completed: false },
      { id: 'obj_kill_automata', description: 'Destroy 3 automata', type: 'kill', target: 'industrial_automaton', current: 0, required: 3, completed: false },
      { id: 'obj_collect_servo', description: 'Collect a servo core', type: 'collect', target: 'servo_core', current: 0, required: 1, completed: false },
      { id: 'obj_return_voss', description: 'Return to Voss', type: 'talk_to', target: 'voss', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 150, creds: 40 },
    repeatable: false,
    prerequisites: [],
    levelRequirement: 5,
  },
  q015_fence_line: {
    id: 'q015_fence_line',
    title: 'FENCE LINE',
    giver: 'voss',
    tier: 3,
    type: 'MULTI',
    description: `helixion security is expanding patrols into wolf territory. voss wants a message sent. fight, hack, or negotiate — she doesn't care how.`,
    objectives: [
      { id: 'obj_reach_factory', description: 'Reach Active Factory perimeter', type: 'go_to', target: 'z03_r06', current: 0, required: 1, completed: false },
      { id: 'obj_assess_checkpoint', description: 'Assess the security checkpoint', type: 'examine', target: 'security_checkpoint', current: 0, required: 1, completed: false },
      { id: 'obj_report_voss', description: 'Report back to Voss', type: 'talk_to', target: 'voss', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 250, creds: 60 },
    repeatable: false,
    prerequisites: ['q014_prove_it'],
    levelRequirement: 7,
  },
  q016_the_shipment: {
    id: 'q016_the_shipment',
    title: 'THE SHIPMENT',
    giver: 'voss',
    tier: 3,
    type: 'MULTI',
    description: `helixion has a cargo container at the docks full of confiscated cyberware. augmentations taken from decommissioned subjects. voss wants them liberated.`,
    objectives: [
      { id: 'obj_reach_docks', description: 'Reach Cargo Docks', type: 'go_to', target: 'z03_r02', current: 0, required: 1, completed: false },
      { id: 'obj_find_container', description: 'Find the target container', type: 'examine', target: 'helixion_containers', current: 0, required: 1, completed: false },
      { id: 'obj_extract_cyberware', description: 'Extract confiscated cyberware', type: 'collect', target: 'confiscated_cyberware', current: 0, required: 1, completed: false },
      { id: 'obj_deliver_voss', description: 'Deliver to Voss', type: 'talk_to', target: 'voss', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 300, creds: 80, items: ['confiscated_cyberware'] },
    repeatable: false,
    prerequisites: ['q015_fence_line'],
    levelRequirement: 8,
  },
  q017_production_records: {
    id: 'q017_production_records',
    title: 'PRODUCTION RECORDS',
    giver: 'brenn',
    tier: 3,
    type: 'SABOTAGE',
    description: `brenn needs the factory production manifest extracted from the assembly line terminal. it proves what helixion is building. getting in and out without triggering lockdown is the job.`,
    objectives: [
      { id: 'obj_reach_assembly', description: 'Reach the Assembly Line', type: 'go_to', target: 'z03_r13', current: 0, required: 1, completed: false },
      { id: 'obj_extract_manifest', description: 'Extract production manifest (TECH ≥ 8)', type: 'examine', target: 'production_terminal', current: 0, required: 1, completed: false },
      { id: 'obj_return_brenn', description: 'Return manifest to Brenn', type: 'talk_to', target: 'brenn', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 275, creds: 70, items: ['production_manifest'] },
    repeatable: false,
    prerequisites: [],
    levelRequirement: 7,
  },
  q018_foremans_exit: {
    id: 'q018_foremans_exit',
    title: "THE FOREMAN'S EXIT",
    giver: 'brenn',
    tier: 3,
    type: 'ESCORT',
    description: `brenn wants out. his mesh has a corporate geofence — cross the district boundary and helixion flags him. he needs iron bloom to remove it. get him there alive.`,
    objectives: [
      { id: 'obj_agree_brenn', description: 'Agree to help Brenn', type: 'talk_to', target: 'brenn', current: 0, required: 1, completed: false },
      { id: 'obj_reach_iron_bloom', description: 'Reach Iron Bloom Entrance', type: 'go_to', target: 'z04_r13', current: 0, required: 1, completed: false },
      { id: 'obj_present_brenn', description: 'Present Brenn to Iron Bloom', type: 'talk_to', target: 'sable', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 300, creds: 75 },
    repeatable: false,
    prerequisites: ['q017_production_records'],
    levelRequirement: 8,
  },
  q019_manifest_discrepancy: {
    id: 'q019_manifest_discrepancy',
    title: 'MANIFEST DISCREPANCY',
    giver: 'oyunn',
    tier: 2,
    type: 'INVESTIGATE',
    description: `more containers arriving than the tower needs. where are the extras going? oyunn wants you to track one from dock to destination.`,
    objectives: [
      { id: 'obj_check_manifest', description: 'Check dock manifests (TECH ≥ 6)', type: 'examine', target: 'manifest_terminal', current: 0, required: 1, completed: false },
      { id: 'obj_track_container', description: 'Track container to Maintenance Tunnels staging', type: 'go_to', target: 'z09_r10', current: 0, required: 1, completed: false },
      { id: 'obj_report_oyunn', description: 'Report findings to Oyunn', type: 'talk_to', target: 'oyunn', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 175, creds: 50 },
    repeatable: false,
    prerequisites: [],
    levelRequirement: 5,
  },
  q020_clean_harbor: {
    id: 'q020_clean_harbor',
    title: 'CLEAN HARBOR',
    giver: 'oyunn',
    tier: 2,
    type: 'MULTI',
    description: `dock scavengers are cracking active containers. oyunn needs them cleared before a high-value shipment tonight. fight them, buy them off, or relocate them.`,
    objectives: [
      { id: 'obj_patrol_waterfront', description: 'Patrol the Waterfront', type: 'go_to', target: 'z03_r01', current: 0, required: 1, completed: false },
      { id: 'obj_clear_scavengers', description: 'Clear scavengers', type: 'kill', target: 'dock_scavenger_waterfront', current: 0, required: 3, completed: false },
      { id: 'obj_confirm_oyunn', description: 'Confirm cleared', type: 'talk_to', target: 'oyunn', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 125, creds: 40 },
    repeatable: false,
    prerequisites: [],
    levelRequirement: 5,
  },
  q021_fresh_meat: {
    id: 'q021_fresh_meat',
    title: 'FRESH MEAT',
    giver: 'rade',
    tier: 2,
    type: 'ARENA',
    description: `rade wants fresh blood in the pit. three rounds. escalating. win all three and you get a standing invitation to the real fights.`,
    objectives: [
      { id: 'obj_enter_pits', description: 'Enter the Fight Pits', type: 'go_to', target: 'z06_r01', current: 0, required: 1, completed: false },
      { id: 'obj_win_rounds', description: 'Win three rounds', type: 'kill', target: 'pit_fighter', current: 0, required: 3, completed: false },
      { id: 'obj_collect_invite', description: 'Collect invitation from Rade', type: 'talk_to', target: 'rade', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 200, creds: 60 },
    repeatable: false,
    prerequisites: [],
    levelRequirement: 5,
  },

  // ── Zone 02: Residential Blocks Quests ──────────────────────────────────

  q022_signal_noise: {
    id: 'q022_signal_noise',
    title: 'SIGNAL NOISE',
    giver: 'tomas_wren',
    tier: 2,
    type: 'INVESTIGATE',
    description: `tomas hears a pattern in the mesh static. he needs recordings from three locations. when combined, they reveal the d9 surveillance frequency map.`,
    objectives: [
      { id: 'obj_record_market', description: 'Record at Block Market', type: 'go_to', target: 'z02_r03', current: 0, required: 1, completed: false },
      { id: 'obj_record_boulevard', description: 'Record at Inner Boulevard', type: 'go_to', target: 'z02_r09', current: 0, required: 1, completed: false },
      { id: 'obj_record_transit', description: 'Record at Transit Station', type: 'go_to', target: 'z02_r11', current: 0, required: 1, completed: false },
      { id: 'obj_return_tomas', description: 'Return recordings to Tomas', type: 'talk_to', target: 'tomas_wren', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 150, creds: 35, items: ['d9_frequency_map'] },
    repeatable: false,
    prerequisites: [],
    levelRequirement: 5,
  },
  q023_clean: {
    id: 'q023_clean',
    title: 'CLEAN',
    giver: 'tomas_wren',
    tier: 2,
    type: 'FETCH',
    description: `tomas wants to get clean. he needs a neural stabilizer compound pee okoro can make, but it requires a component from the industrial district.`,
    objectives: [
      { id: 'obj_talk_pee', description: 'Get compound requirements from Pee Okoro', type: 'talk_to', target: 'pee_okoro', current: 0, required: 1, completed: false },
      { id: 'obj_get_compound', description: 'Find neural compound in Industrial District', type: 'collect', target: 'neural_compound', current: 0, required: 1, completed: false },
      { id: 'obj_deliver_pee', description: 'Deliver component to Pee Okoro for synthesis', type: 'talk_to', target: 'pee_okoro', current: 0, required: 1, completed: false },
      { id: 'obj_deliver_tomas', description: 'Deliver stabilizer to Tomas', type: 'talk_to', target: 'tomas_wren', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 125, creds: 30 },
    repeatable: false,
    prerequisites: ['q022_signal_noise'],
    levelRequirement: 5,
  },
  q024_eyes_everywhere: {
    id: 'q024_eyes_everywhere',
    title: 'EYES EVERYWHERE',
    giver: 'sixer',
    tier: 2,
    type: 'MULTI',
    description: `sixer wants to expand his network. plant monitoring devices at three locations. don't get caught — being seen flags you with d9.`,
    objectives: [
      { id: 'obj_plant_transit', description: 'Plant device at Transit Station', type: 'go_to', target: 'z02_r11', current: 0, required: 1, completed: false },
      { id: 'obj_plant_clinic', description: 'Plant device at Mesh Clinic', type: 'go_to', target: 'z02_r10', current: 0, required: 1, completed: false },
      { id: 'obj_plant_market', description: 'Plant device at Block Market', type: 'go_to', target: 'z02_r03', current: 0, required: 1, completed: false },
      { id: 'obj_confirm_sixer', description: 'Confirm placement with Sixer', type: 'talk_to', target: 'sixer', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 150, creds: 40 },
    repeatable: false,
    prerequisites: [],
    levelRequirement: 5,
  },
  q025_real_seeds: {
    id: 'q025_real_seeds',
    title: 'REAL SEEDS',
    giver: 'mae',
    tier: 2,
    type: 'FETCH',
    description: `mae's seed stock is running low. the squatters in block 17 have a connection to someone in the industrial district who salvages pre-helixion seed varieties. make the connection.`,
    objectives: [
      { id: 'obj_talk_squatters', description: 'Get contact info from Squatter Floors', type: 'talk_to', target: 'squatter_residents', current: 0, required: 1, completed: false },
      { id: 'obj_find_source', description: 'Find seed source at Industrial Salvage Yard', type: 'go_to', target: 'z03_r03', current: 0, required: 1, completed: false },
      { id: 'obj_get_seeds', description: 'Obtain heirloom seeds', type: 'collect', target: 'heirloom_seeds', current: 0, required: 1, completed: false },
      { id: 'obj_deliver_mae', description: 'Deliver seeds to Mae', type: 'talk_to', target: 'mae', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 125, creds: 25 },
    repeatable: false,
    prerequisites: [],
    levelRequirement: 5,
  },
  q026_source_material: {
    id: 'q026_source_material',
    title: 'SOURCE MATERIAL',
    giver: 'asha_osei',
    tier: 2,
    type: 'INVESTIGATE',
    description: `asha wants a firsthand account of conditions in the drainage nexus. take her recorder. get testimony from the parish. bring it back.`,
    objectives: [
      { id: 'obj_get_recorder', description: 'Get recorder from Asha', type: 'collect', target: 'recording_device', current: 0, required: 1, completed: false },
      { id: 'obj_record_doss', description: 'Record Doss\'s testimony', type: 'talk_to', target: 'doss', current: 0, required: 1, completed: false },
      { id: 'obj_return_asha', description: 'Return recordings to Asha', type: 'talk_to', target: 'asha_osei', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 175, creds: 40 },
    repeatable: false,
    prerequisites: [],
    levelRequirement: 6,
  },
  q027_the_vanished: {
    id: 'q027_the_vanished',
    title: 'THE VANISHED',
    giver: 'asha_osei',
    tier: 3,
    type: 'INVESTIGATE',
    description: `residents are going to priority compliance appointments and not coming back. asha has three names. track them from the mesh clinic to wherever they went.`,
    objectives: [
      { id: 'obj_investigate_clinic', description: 'Investigate Mesh Clinic records (TECH ≥ 7)', type: 'go_to', target: 'z02_r10', current: 0, required: 1, completed: false },
      { id: 'obj_extract_records', description: 'Extract patient data', type: 'examine', target: 'clinic_records', current: 0, required: 1, completed: false },
      { id: 'obj_follow_trail', description: 'Follow trail to Helixion Compliance Wing', type: 'go_to', target: 'z01_r01', current: 0, required: 1, completed: false },
      { id: 'obj_report_asha', description: 'Report findings to Asha', type: 'talk_to', target: 'asha_osei', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 275, creds: 60, items: ['chrysalis_targeting_data'] },
    repeatable: false,
    prerequisites: ['q026_source_material'],
    levelRequirement: 7,
  },

  // ── Zone 10: Industrial Drainage Quests ──────────────────────────────────

  q028_surplus: {
    id: 'q028_surplus',
    title: 'SURPLUS',
    giver: 'cutter',
    tier: 2,
    type: 'INVESTIGATE',
    description: `cyberware is disappearing from the stash rooms. small quantities, consistently. someone is skimming. cutter needs you to find out who without alerting the guards.`,
    objectives: [
      { id: 'obj_read_log', description: 'Read the checkpoint log (GHOST ≥ 7)', type: 'examine', target: 'checkpoint_log', current: 0, required: 1, completed: false },
      { id: 'obj_check_inventory', description: 'Examine the stash inventory', type: 'examine', target: 'stash_inventory', current: 0, required: 1, completed: false },
      { id: 'obj_report_cutter', description: 'Report findings to Cutter', type: 'talk_to', target: 'cutter', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 175, creds: 45 },
    repeatable: false,
    prerequisites: [],
    levelRequirement: 7,
  },
  q029_the_count: {
    id: 'q029_the_count',
    title: 'THE COUNT',
    giver: 'cutter',
    tier: 3,
    type: 'INVESTIGATE',
    description: `voss is stockpiling. more weapons, more combat augmentations than the wolves need. cutter wants to know what voss knows. discreetly.`,
    objectives: [
      { id: 'obj_examine_hardware', description: 'Examine the unidentified hardware in the vault', type: 'examine', target: 'unidentified_hardware', current: 0, required: 1, completed: false },
      { id: 'obj_visit_den', description: 'Visit the Wolf Den', type: 'go_to', target: 'z03_r10', current: 0, required: 1, completed: false },
      { id: 'obj_report_cutter_count', description: 'Report to Cutter', type: 'talk_to', target: 'cutter', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 250, creds: 60 },
    repeatable: false,
    prerequisites: ['q028_surplus'],
    levelRequirement: 8,
  },
  q030_the_source: {
    id: 'q030_the_source',
    title: 'THE SOURCE',
    giver: 'acre',
    tier: 2,
    type: 'FETCH',
    description: `acre needs an undiluted sample from the bypass's deepest point. the concentration is lethal without protection. what the sample reveals changes everything about the assembly line.`,
    objectives: [
      { id: 'obj_get_kit', description: 'Collect chemical sample kit from Acre', type: 'collect', target: 'chemical_sample_kit', current: 0, required: 1, completed: false },
      { id: 'obj_sample_channel', description: 'Sample the dedicated channel (requires protection)', type: 'examine', target: 'dedicated_channel', current: 0, required: 1, completed: false },
      { id: 'obj_return_acre', description: 'Return sample to Acre', type: 'talk_to', target: 'acre', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 175, creds: 50, items: ['neural_tissue_analysis'] },
    repeatable: false,
    prerequisites: [],
    levelRequirement: 7,
  },
  q031_purification: {
    id: 'q031_purification',
    title: 'PURIFICATION',
    giver: 'brine',
    tier: 3,
    type: 'MULTI',
    description: `the treatment station is broken. has been for years. brine says it can be fixed. three components needed. fixing it permanently improves the parish's water.`,
    objectives: [
      { id: 'obj_get_filter', description: 'Obtain treatment filter', type: 'collect', target: 'treatment_filter', current: 0, required: 1, completed: false },
      { id: 'obj_get_agent', description: 'Obtain neutralizing agent', type: 'collect', target: 'neutralizing_agent', current: 0, required: 1, completed: false },
      { id: 'obj_get_motor', description: 'Obtain pump motor', type: 'collect', target: 'pump_motor', current: 0, required: 1, completed: false },
      { id: 'obj_repair_station', description: 'Repair the station (TECH ≥ 7)', type: 'go_to', target: 'z10_r06', current: 0, required: 1, completed: false },
      { id: 'obj_report_brine', description: 'Report to Brine', type: 'talk_to', target: 'brine', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 300, creds: 70 },
    repeatable: false,
    prerequisites: [],
    levelRequirement: 8,
  },
  q032_upstream: {
    id: 'q032_upstream',
    title: 'UPSTREAM',
    giver: 'brine',
    tier: 2,
    type: 'ESCORT',
    description: `brine needs to get back to the nexus. the lower drainage is between her and home. escort her through the corroded tunnels.`,
    objectives: [
      { id: 'obj_agree_brine', description: 'Talk to Brine about the escort', type: 'talk_to', target: 'brine', current: 0, required: 1, completed: false },
      { id: 'obj_cross_tunnels', description: 'Cross the Corroded Tunnels', type: 'go_to', target: 'z10_r07', current: 0, required: 1, completed: false },
      { id: 'obj_reach_outpost', description: 'Reach the Parish Outpost', type: 'go_to', target: 'z10_r08', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 150, creds: 35 },
    repeatable: false,
    prerequisites: [],
    levelRequirement: 7,
  },
  q033_defection: {
    id: 'q033_defection',
    title: 'DEFECTION',
    giver: 'strand',
    tier: 3,
    type: 'ESCORT',
    description: `strand has proof the wolves are helixion contractors. he needs to reach iron bloom. the route goes through the abandoned transit. he's scared and he can fight but he's not thinking straight.`,
    objectives: [
      { id: 'obj_talk_strand', description: 'Talk to Strand', type: 'talk_to', target: 'strand', current: 0, required: 1, completed: false },
      { id: 'obj_reach_transit', description: 'Reach the Abandoned Transit', type: 'go_to', target: 'z11_r01', current: 0, required: 1, completed: false },
      { id: 'obj_reach_bloom', description: 'Reach Iron Bloom', type: 'go_to', target: 'z12_r01', current: 0, required: 1, completed: false },
      { id: 'obj_debrief_strand', description: 'Debrief with Strand', type: 'talk_to', target: 'strand', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 350, creds: 80, items: ['wolf_helixion_documents'] },
    repeatable: false,
    prerequisites: [],
    levelRequirement: 9,
  },

  // ── Zone 06: Fight Pits Quests ──────────────────────────────────────────

  q034_the_ladder: {
    id: 'q034_the_ladder',
    title: 'THE LADDER',
    giver: 'rade',
    tier: 2,
    type: 'ARENA',
    description: `the pit has four tiers. fresh meat, regulars, the circuit, the champion. fight your way through all of them. each tier, three fights. the champion is one.`,
    objectives: [
      { id: 'obj_tier1_fights', description: 'Win 3 Tier 1 matches (Fresh Meat)', type: 'kill', target: 'pit_fighter_t1', current: 0, required: 3, completed: false },
      { id: 'obj_tier2_fights', description: 'Win 3 Tier 2 matches (Regulars)', type: 'kill', target: 'pit_fighter_t2', current: 0, required: 3, completed: false },
      { id: 'obj_tier3_fights', description: 'Win 2 Tier 3 matches (Circuit)', type: 'kill', target: 'pit_fighter_t3', current: 0, required: 2, completed: false },
      { id: 'obj_beast_match', description: 'Survive the Beast Match', type: 'kill', target: 'pit_beast', current: 0, required: 1, completed: false },
      { id: 'obj_report_rade', description: 'Report to Rade', type: 'talk_to', target: 'rade', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 400, creds: 100 },
    repeatable: false,
    prerequisites: [],
    levelRequirement: 6,
  },
  q035_the_fix: {
    id: 'q035_the_fix',
    title: 'THE FIX',
    giver: 'spit',
    tier: 2,
    type: 'INVESTIGATE',
    description: `a fighter's been throwing matches. the losses are costing the book. find who's paying him to lose.`,
    objectives: [
      { id: 'obj_talk_spit', description: 'Talk to Spit about the thrown matches', type: 'talk_to', target: 'spit', current: 0, required: 1, completed: false },
      { id: 'obj_watch_fights', description: 'Watch fights from the pit (detect the fix)', type: 'examine', target: 'pit_floor', current: 0, required: 1, completed: false },
      { id: 'obj_backrooms', description: 'Investigate the Back Rooms', type: 'go_to', target: 'z06_r07', current: 0, required: 1, completed: false },
      { id: 'obj_find_agent', description: 'Identify the D9 agent\'s involvement', type: 'examine', target: 'the_d9_agent', current: 0, required: 1, completed: false },
      { id: 'obj_report_spit', description: 'Report to Spit', type: 'talk_to', target: 'spit', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 200, creds: 50 },
    repeatable: false,
    prerequisites: [],
    levelRequirement: 7,
  },
  q036_the_old_way: {
    id: 'q036_the_old_way',
    title: 'THE OLD WAY',
    giver: 'grath',
    tier: 2,
    type: 'ARENA',
    description: `win a tier 2 match with nothing. no augmentation, no stims, no edge. just you.`,
    objectives: [
      { id: 'obj_talk_grath', description: 'Accept Grath\'s challenge', type: 'talk_to', target: 'grath', current: 0, required: 1, completed: false },
      { id: 'obj_clean_fight', description: 'Win a Tier 2 match unaugmented', type: 'kill', target: 'pit_fighter_t2', current: 0, required: 1, completed: false },
      { id: 'obj_return_grath', description: 'Return to Grath', type: 'talk_to', target: 'grath', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 175, creds: 30 },
    repeatable: false,
    prerequisites: [],
    levelRequirement: 8,
  },
  q037_champions_story: {
    id: 'q037_champions_story',
    title: 'THE CHAMPION\'S STORY',
    giver: 'grath',
    tier: 3,
    type: 'INVESTIGATE',
    description: `grath tells you about sera. he trained her. she fights angry now. he wants you to beat her — not for the title, but to stop her before she kills someone.`,
    objectives: [
      { id: 'obj_listen_grath', description: 'Listen to Grath\'s story about Sera', type: 'talk_to', target: 'grath', current: 0, required: 1, completed: false },
      { id: 'obj_watch_sera', description: 'Watch The Current fight from the pit window', type: 'examine', target: 'pit_window', current: 0, required: 1, completed: false },
      { id: 'obj_challenge_sera', description: 'Defeat The Current', type: 'kill', target: 'the_current', current: 0, required: 1, completed: false },
      { id: 'obj_debrief_grath', description: 'Return to Grath', type: 'talk_to', target: 'grath', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 250, creds: 60 },
    repeatable: false,
    prerequisites: ['q036_the_old_way'],
    levelRequirement: 10,
  },
  q038_house_business: {
    id: 'q038_house_business',
    title: 'HOUSE BUSINESS',
    giver: 'rade',
    tier: 3,
    type: 'INVESTIGATE',
    description: `someone is skimming from the betting pool. the theft is small but consistent. organized. find who.`,
    objectives: [
      { id: 'obj_talk_rade_skim', description: 'Talk to Rade about the discrepancy', type: 'talk_to', target: 'rade', current: 0, required: 1, completed: false },
      { id: 'obj_check_board', description: 'Examine the betting board', type: 'examine', target: 'betting_board', current: 0, required: 1, completed: false },
      { id: 'obj_backroom_intel', description: 'Gather intel in the Back Rooms', type: 'examine', target: 'overheard_conversations', current: 0, required: 1, completed: false },
      { id: 'obj_trace_trail', description: 'Follow the trail to the Freemarket broker', type: 'go_to', target: 'z06_r07', current: 0, required: 1, completed: false },
      { id: 'obj_report_rade_skim', description: 'Report findings to Rade', type: 'talk_to', target: 'rade', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 250, creds: 70 },
    repeatable: false,
    prerequisites: [],
    levelRequirement: 8,
  },
  q039_beast_problem: {
    id: 'q039_beast_problem',
    title: 'THE BEAST PROBLEM',
    giver: 'rade',
    tier: 2,
    type: 'MULTI',
    description: `feral augments for the beast matches are running out. the fringe population is thinning. find a new source or find an alternative.`,
    objectives: [
      { id: 'obj_talk_rade_beast', description: 'Talk to Rade about the sourcing problem', type: 'talk_to', target: 'rade', current: 0, required: 1, completed: false },
      { id: 'obj_investigate_source', description: 'Investigate alternatives (visit the Fringe or negotiate)', type: 'go_to', target: 'z04_r01', current: 0, required: 1, completed: false },
      { id: 'obj_decide', description: 'Make a decision and report to Rade', type: 'talk_to', target: 'rade', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 175, creds: 40 },
    repeatable: false,
    prerequisites: [],
    levelRequirement: 7,
  },
  q040_pit_instinct: {
    id: 'q040_pit_instinct',
    title: 'PIT INSTINCT',
    giver: 'rade',
    tier: 3,
    type: 'ARENA',
    description: `you beat the champion. the pit is yours. rade wants to formalize it. the crowd wants to see you do it again. the instinct is permanent — you see openings before they exist.`,
    objectives: [
      { id: 'obj_defeat_champion', description: 'Defeat The Current (Champion match)', type: 'kill', target: 'the_current', current: 0, required: 1, completed: false },
      { id: 'obj_claim_title', description: 'Claim the Championship from Rade', type: 'talk_to', target: 'rade', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 500, creds: 100 },
    repeatable: false,
    prerequisites: ['q037_champions_story'],
    levelRequirement: 12,
  },

  // ── Zone 01: Helixion Campus Quests ──────────────────────────────────────

  q041_dead_drop: {
    id: 'q041_dead_drop',
    title: 'DEAD DROP',
    giver: 'yara',
    tier: 3,
    type: 'DELIVERY',
    description: `yara needs a data package delivered to a freemarket fence in the industrial district. it contains chrysalis research files. she can't leave the building without triggering mesh compliance flags. you carry it out. if caught, she denies everything.`,
    objectives: [
      { id: 'obj_talk_yara', description: 'Get the data package from Yara', type: 'talk_to', target: 'yara', current: 0, required: 1, completed: false },
      { id: 'obj_collect_files', description: 'Collect the Chrysalis research files', type: 'collect', target: 'chrysalis_research_files', current: 0, required: 1, completed: false },
      { id: 'obj_exit_campus', description: 'Exit the campus without triggering alarm', type: 'go_to', target: 'z01_r01', current: 0, required: 1, completed: false },
      { id: 'obj_deliver_fence', description: 'Deliver to Freemarket fence in Industrial District', type: 'go_to', target: 'z03_r05', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 300, creds: 80 },
    repeatable: false,
    prerequisites: [],
    levelRequirement: 13,
  },
  q042_vasik_files: {
    id: 'q042_vasik_files',
    title: 'THE VASIK FILES',
    giver: 'dr_vasik',
    tier: 4,
    type: 'SABOTAGE',
    description: `dr. vasik has a complete copy of the chrysalis research data. she needs someone to extract it from the server core terminal and deliver it to iron bloom. if helixion discovers she's the source, they will decommission her. this is the most important intel quest in the game.`,
    objectives: [
      { id: 'obj_talk_vasik', description: 'Talk to Dr. Vasik about the data', type: 'talk_to', target: 'dr_vasik', current: 0, required: 1, completed: false },
      { id: 'obj_reach_server', description: 'Reach the Server Core', type: 'go_to', target: 'z01_r10', current: 0, required: 1, completed: false },
      { id: 'obj_extract_data', description: 'Extract Chrysalis data from terminal (TECH ≥ 6)', type: 'examine', target: 'central_terminal', current: 0, required: 1, completed: false },
      { id: 'obj_deliver_bloom', description: 'Deliver data to Iron Bloom', type: 'go_to', target: 'z12_r01', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 500, creds: 120, items: ['vasik_drive'] },
    repeatable: false,
    prerequisites: [],
    levelRequirement: 15,
  },
  q043_kill_switch: {
    id: 'q043_kill_switch',
    title: 'KILL SWITCH',
    giver: 'dr_vasik',
    tier: 4,
    type: 'ESCORT',
    description: `dr. vasik's own implant has a corporate kill-switch she can't remove without dying. serrano at iron bloom can remove it. but getting her out of the campus alive is its own quest.`,
    objectives: [
      { id: 'obj_agree_vasik', description: 'Agree to escort Dr. Vasik', type: 'talk_to', target: 'dr_vasik', current: 0, required: 1, completed: false },
      { id: 'obj_exit_campus_vasik', description: 'Exit the campus with Vasik', type: 'go_to', target: 'z01_r01', current: 0, required: 1, completed: false },
      { id: 'obj_reach_iron_bloom', description: 'Reach Iron Bloom for implant removal', type: 'go_to', target: 'z12_r01', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 500, creds: 100 },
    repeatable: false,
    prerequisites: ['q042_vasik_files'],
    levelRequirement: 15,
  },
  q044_extraction: {
    id: 'q044_extraction',
    title: 'EXTRACTION',
    giver: 'ec_330917',
    tier: 4,
    type: 'ESCORT',
    description: `free EC-330917 from containment. escort through the campus to iron bloom. he can barely walk — mesh withdrawal. every floor between here and the exit has security. if you get him to iron bloom, serrano can stabilize him.`,
    objectives: [
      { id: 'obj_open_cell', description: 'Open Cell 3 in the Containment Wing', type: 'examine', target: 'cell_3_glass', current: 0, required: 1, completed: false },
      { id: 'obj_escort_campus', description: 'Escort EC-330917 through the campus', type: 'go_to', target: 'z01_r01', current: 0, required: 1, completed: false },
      { id: 'obj_deliver_bloom_ec', description: 'Deliver EC-330917 to Iron Bloom', type: 'go_to', target: 'z12_r01', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 400, creds: 80, items: ['ec_neural_stabilizer'] },
    repeatable: false,
    prerequisites: [],
    levelRequirement: 14,
  },

  // ── Zone 07: Rooftop Network Quests ─────────────────────────────────────

  q045_frequency_rights: {
    id: 'q045_frequency_rights',
    title: 'FREQUENCY RIGHTS',
    giver: 'kite',
    tier: 2,
    type: 'INVESTIGATE',
    description: `kite's broadcast signal is being jammed — someone is running a counter-signal from the industrial rooftops. she suspects cell two, but it could be d9. cross the span. find the jammer. shut it down.`,
    objectives: [
      { id: 'obj_cross_span', description: 'Cross the Span to the industrial segment', type: 'go_to', target: 'z07_r05', current: 0, required: 1, completed: false },
      { id: 'obj_find_jammer', description: 'Find the jamming source on the industrial rooftops', type: 'examine', target: 'pirate_hardware', current: 0, required: 1, completed: false },
      { id: 'obj_destroy_jammer', description: 'Destroy the D9 jammer', type: 'examine', target: 'd9_jammer_device', current: 0, required: 1, completed: false },
      { id: 'obj_return_kite', description: 'Return to Kite', type: 'talk_to', target: 'kite', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 175, creds: 45, factionRep: { THE_SIGNAL: 15 } },
    repeatable: false,
    prerequisites: [],
    levelRequirement: 8,
  },
  q046_the_archive: {
    id: 'q046_the_archive',
    title: 'THE ARCHIVE',
    giver: 'kite',
    tier: 3,
    type: 'DELIVERY',
    description: `kite has been archiving intercepted helixion communications for three years. she's noticed a 33hz carrier wave embedded in the mesh signal during every firmware update. she wants you to deliver her data to someone who can analyze it. three destinations, three outcomes.`,
    objectives: [
      { id: 'obj_collect_archive', description: 'Collect Kite\'s archive data', type: 'collect', target: 'kite_archive_data', current: 0, required: 1, completed: false },
      { id: 'obj_deliver_archive', description: 'Deliver archive to an analyst (z05, z01, or z12)', type: 'deliver', target: 'archive_delivery', current: 0, required: 1, completed: false },
      { id: 'obj_report_kite', description: 'Report the analysis to Kite', type: 'talk_to', target: 'kite', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 275, creds: 65, items: ['decoded_33hz_fragment'] },
    branches: [
      {
        id: 'deliver_sura',
        label: 'Sura (Nomad Relay)',
        description: 'Sura analyzes the data through the nomad observation framework. The 33hz carrier is natural — it predates the mesh.',
        consequences: { factionRep: { THE_SIGNAL: 10 }, worldFlags: { archive_destination: 'sura' } },
        rewards: { xp: 275, creds: 65, items: ['decoded_33hz_fragment'] },
      },
      {
        id: 'deliver_vasik',
        label: 'Dr. Vasik (Helixion)',
        description: 'Vasik analyzes the data through helixion research tools. The 33hz carrier is the compliance signal\'s substrate. It runs beneath everything.',
        consequences: { factionRep: { THE_SIGNAL: 5, HELIXION: -10 }, worldFlags: { archive_destination: 'vasik' } },
        rewards: { xp: 275, creds: 65, items: ['decoded_33hz_fragment'] },
      },
      {
        id: 'deliver_iron_bloom',
        label: 'Iron Bloom Server Farm',
        description: 'Iron Bloom\'s processors crunch the data. The 33hz carrier has the same mathematical structure as neural activity. It\'s a brain. Broadcasting.',
        consequences: { factionRep: { THE_SIGNAL: 10, IRON_BLOOM: 10 }, worldFlags: { archive_destination: 'iron_bloom' } },
        rewards: { xp: 275, creds: 65, items: ['decoded_33hz_fragment'] },
      },
    ],
    repeatable: false,
    prerequisites: ['q045_frequency_rights'],
    levelRequirement: 10,
  },
  q047_dead_drop_rooftop: {
    id: 'q047_dead_drop_rooftop',
    title: 'DEAD DROP',
    giver: 'ghost_wire',
    tier: 2,
    type: 'ESCORT',
    description: `ghost wire needs backup. a package delivery has been intercepted twice — someone on the route is stealing. escort a delivery from cell one to cell two across the span. the thief turns out to be a d9 operative.`,
    objectives: [
      { id: 'obj_accept_package', description: 'Accept the package from Ghost Wire', type: 'talk_to', target: 'ghost_wire', current: 0, required: 1, completed: false },
      { id: 'obj_cross_span_escort', description: 'Cross the Span with the delivery', type: 'go_to', target: 'z07_r04', current: 0, required: 1, completed: false },
      { id: 'obj_handle_operative', description: 'Deal with the D9 operative', type: 'kill', target: 'd9_rooftop_operative', current: 0, required: 1, completed: false },
      { id: 'obj_deliver_cell_two', description: 'Complete delivery to Cell Two HQ', type: 'go_to', target: 'z07_r07', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 175, creds: 40, items: ['signal_booster'] },
    repeatable: false,
    prerequisites: [],
    levelRequirement: 8,
  },
  q048_signal_war: {
    id: 'q048_signal_war',
    title: 'SIGNAL WAR',
    giver: 'torque',
    tier: 2,
    type: 'INVESTIGATE',
    description: `torque's broadcasts are being degraded — signal quality dropping across the industrial segment. he suspects d9 counter-measures but can't locate the source from the rooftop. the source is a d9 signal suppression unit inside the active factory.`,
    objectives: [
      { id: 'obj_investigate_factory', description: 'Enter the Active Factory', type: 'go_to', target: 'z03_r06', current: 0, required: 1, completed: false },
      { id: 'obj_find_suppressor', description: 'Find the D9 suppression unit', type: 'examine', target: 'd9_suppression_unit', current: 0, required: 1, completed: false },
      { id: 'obj_destroy_suppressor', description: 'Destroy the suppression unit', type: 'examine', target: 'd9_suppression_unit_destroy', current: 0, required: 1, completed: false },
      { id: 'obj_return_torque', description: 'Report to Torque', type: 'talk_to', target: 'torque', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 200, creds: 50, factionRep: { THE_SIGNAL: 20 } },
    repeatable: false,
    prerequisites: [],
    levelRequirement: 9,
  },
  q049_tower_watch: {
    id: 'q049_tower_watch',
    title: 'TOWER WATCH',
    giver: 'torque',
    tier: 3,
    type: 'SABOTAGE',
    description: `torque has been watching the broadcast tower. it's not just broadcasting — it's receiving. a signal comes in on 33hz, the tower processes it, and a modulated version goes out across the mesh. the tower is a transceiver. plant a signal tap. the approach crosses the kill zone.`,
    objectives: [
      { id: 'obj_prep_tap', description: 'Get signal tap equipment from Torque', type: 'talk_to', target: 'torque', current: 0, required: 1, completed: false },
      { id: 'obj_cross_killzone', description: 'Cross the Kill Zone', type: 'go_to', target: 'z07_r09', current: 0, required: 1, completed: false },
      { id: 'obj_reach_campus_ridge', description: 'Reach Campus Ridge', type: 'go_to', target: 'z07_r10', current: 0, required: 1, completed: false },
      { id: 'obj_plant_tap', description: 'Plant signal tap on the Broadcast Tower approach', type: 'examine', target: 'tower_view_close', current: 0, required: 1, completed: false },
      { id: 'obj_return_torque_tap', description: 'Return tap data to Torque', type: 'talk_to', target: 'torque', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 350, creds: 80, items: ['intercept_data'], worldFlags: { tower_is_transceiver: true } },
    repeatable: false,
    prerequisites: ['q048_signal_war'],
    levelRequirement: 12,
  },
  q050_ghost_in_signal: {
    id: 'q050_ghost_in_signal',
    title: 'GHOST IN THE SIGNAL',
    giver: 'wavelength',
    tier: 3,
    type: 'MULTI',
    description: `wavelength has detected something in the 33hz frequency. not just a carrier wave — a pattern. repeating. structured. it looks like data. place signal taps at three city locations. combined data reveals the signal's structure: it IS language. the substrate is communicating.`,
    objectives: [
      { id: 'obj_talk_wavelength', description: 'Get briefing and tap equipment from Wavelength', type: 'talk_to', target: 'wavelength', current: 0, required: 1, completed: false },
      { id: 'obj_tap_drainage', description: 'Place signal tap at Drainage Nexus Signal Hollow (z08_r14)', type: 'go_to', target: 'z08_r14', current: 0, required: 1, completed: false },
      { id: 'obj_tap_fringe', description: 'Place signal tap at Overgrown Courtyard (z04_r12)', type: 'go_to', target: 'z04_r12', current: 0, required: 1, completed: false },
      { id: 'obj_tap_substrate', description: 'Place signal tap at Substrate Level entrance (z14_r01)', type: 'go_to', target: 'z14_r01', current: 0, required: 1, completed: false },
      { id: 'obj_return_wavelength', description: 'Return combined data to Wavelength', type: 'talk_to', target: 'wavelength', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 400, creds: 100, items: ['spectrum_analysis'], worldFlags: { substrate_language_discovered: true } },
    repeatable: false,
    prerequisites: [],
    levelRequirement: 10,
  },

  // ── Zone 11: Abandoned Transit Quests ──────────────────────────────────

  q055_dead_section: {
    id: 'q055_dead_section',
    title: 'DEAD SECTION',
    giver: 'compass',
    tier: 2,
    type: 'INVESTIGATE',
    description: `compass has mapped the entire transit system — except one section. the Blue Line south of Central. the Substrate growth is too active for her to survey safely. she needs someone to go in, document the extent of the growth, and report back. what you'll find: the Substrate isn't just growing. it's replacing.`,
    objectives: [
      { id: 'obj_talk_compass_dead', description: 'Talk to Compass about the unmapped section', type: 'talk_to', target: 'compass', current: 0, required: 1, completed: false },
      { id: 'obj_enter_blue_south', description: 'Enter Blue Tunnel South', type: 'go_to', target: 'z11_r11', current: 0, required: 1, completed: false },
      { id: 'obj_examine_growth', description: 'Document the Substrate growth', type: 'examine', target: 'crystalline_formations', current: 0, required: 1, completed: false },
      { id: 'obj_reach_south_platform', description: 'Reach South Platform', type: 'go_to', target: 'z11_r12', current: 0, required: 1, completed: false },
      { id: 'obj_return_compass_dead', description: 'Return survey data to Compass', type: 'talk_to', target: 'compass', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 200, creds: 50, items: ['transit_map_blue'] },
    repeatable: false,
    prerequisites: [],
    levelRequirement: 10,
  },
  q056_last_schedule: {
    id: 'q056_last_schedule',
    title: 'THE LAST SCHEDULE',
    giver: 'compass',
    tier: 2,
    type: 'INVESTIGATE',
    description: `compass found something in the transit logs. on the system's final day of operation, every train was rerouted to South Platform. every single one. that's not a shutdown procedure. that's an extraction. someone used the transit system to move something from the deep to the surface. she needs you to investigate South Platform and find out what.`,
    objectives: [
      { id: 'obj_talk_compass_sched', description: 'Talk to Compass about the schedule anomaly', type: 'talk_to', target: 'compass', current: 0, required: 1, completed: false },
      { id: 'obj_reach_south_sched', description: 'Reach South Platform', type: 'go_to', target: 'z11_r12', current: 0, required: 1, completed: false },
      { id: 'obj_talk_station', description: 'Talk to Station about the final day', type: 'talk_to', target: 'station', current: 0, required: 1, completed: false },
      { id: 'obj_examine_manifest', description: 'Examine the cargo manifest', type: 'examine', target: 'cargo_manifest', current: 0, required: 1, completed: false },
      { id: 'obj_return_compass_sched', description: 'Return findings to Compass', type: 'talk_to', target: 'compass', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 225, creds: 55, items: ['cargo_manifest_copy'] },
    repeatable: false,
    prerequisites: [],
    levelRequirement: 10,
  },
  q057_the_way_back: {
    id: 'q057_the_way_back',
    title: 'THE WAY BACK',
    giver: 'ever',
    tier: 2,
    type: 'ESCORT',
    description: `ever took the Loop. she's been walking in the dark for two days. her light ran out. she made it to South Platform alive but she can't make it back alone. escort her north through the Blue Line tunnels — through Substrate growth and deep dweller territory — to Central Station. light management is critical. she doesn't have any.`,
    objectives: [
      { id: 'obj_talk_ever', description: 'Talk to Ever at South Platform', type: 'talk_to', target: 'ever', current: 0, required: 1, completed: false },
      { id: 'obj_cross_blue_south', description: 'Cross Blue Tunnel South with Ever', type: 'go_to', target: 'z11_r11', current: 0, required: 1, completed: false },
      { id: 'obj_reach_central_escort', description: 'Reach Central Station', type: 'go_to', target: 'z11_r04', current: 0, required: 1, completed: false },
      { id: 'obj_debrief_ever', description: 'Deliver Ever safely to Central Station', type: 'talk_to', target: 'compass', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 175, creds: 40 },
    repeatable: false,
    prerequisites: [],
    levelRequirement: 9,
  },

  // ── Zone 05: Fringe Nomads Quests ──────────────────────────────────────

  q051_prove_clean: {
    id: 'q051_prove_clean',
    title: 'PROVE YOU\'RE NOT FOLLOWED',
    giver: 'neva',
    tier: 2,
    type: 'INVESTIGATE',
    description: `neva doesn't trust you. nobody from the city gets trusted without proof. watch the approach from the ridge for six hours. prove nobody followed you. prove the city doesn't care enough to chase you. that knowledge is both freedom and a wound.`,
    objectives: [
      { id: 'obj_talk_neva_clean', description: 'Talk to Neva about earning trust', type: 'talk_to', target: 'neva', current: 0, required: 1, completed: false },
      { id: 'obj_reach_ridge', description: 'Reach The Ridge', type: 'go_to', target: 'z05_r09', current: 0, required: 1, completed: false },
      { id: 'obj_observe', description: 'Observe the approach route (examine watch point)', type: 'examine', target: 'neva_quest_marker', current: 0, required: 1, completed: false },
      { id: 'obj_return_neva_clean', description: 'Return to Neva', type: 'talk_to', target: 'neva', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 125, creds: 25 },
    repeatable: false,
    prerequisites: [],
    levelRequirement: 3,
  },
  q052_missing_walker: {
    id: 'q052_missing_walker',
    title: 'THE MISSING WALKER',
    giver: 'neva',
    tier: 2,
    type: 'INVESTIGATE',
    description: `a nomad ranger — one of the walkers who scout the perimeter — hasn't reported in three days. neva wants them found. the trail leads toward the city's edge. what you find isn't the walker. it's evidence of what took them: helixion restraint hardware. field-grade tranquilizer casings. a retrieval team was here.`,
    objectives: [
      { id: 'obj_talk_neva_walker', description: 'Get details from Neva', type: 'talk_to', target: 'neva', current: 0, required: 1, completed: false },
      { id: 'obj_search_nml', description: 'Search No-Man\'s Land for tracks', type: 'go_to', target: 'z05_r02', current: 0, required: 1, completed: false },
      { id: 'obj_search_perimeter', description: 'Search The Perimeter for evidence', type: 'go_to', target: 'z05_r01', current: 0, required: 1, completed: false },
      { id: 'obj_find_evidence', description: 'Find Helixion retrieval evidence', type: 'examine', target: 'sensor_fence', current: 0, required: 1, completed: false },
      { id: 'obj_return_neva_walker', description: 'Report to Neva', type: 'talk_to', target: 'neva', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 175, creds: 40, items: ['tranq_casing'] },
    repeatable: false,
    prerequisites: ['q051_prove_clean'],
    levelRequirement: 4,
  },
  q053_signal_question: {
    id: 'q053_signal_question',
    title: 'THE SIGNAL QUESTION',
    giver: 'neva',
    tier: 3,
    type: 'INVESTIGATE',
    description: `the nomads have noticed something strange. wild animals avoid certain areas. plants grow differently in patches. sura's equipment picks up a frequency — 33hz — coming from underground. neva wants to know what it is. investigate the anomaly at the signal relay. this bridges the nomad zone to the deeper lore.`,
    objectives: [
      { id: 'obj_talk_neva_signal', description: 'Talk to Neva about the anomaly', type: 'talk_to', target: 'neva', current: 0, required: 1, completed: false },
      { id: 'obj_visit_relay', description: 'Visit the Signal Relay', type: 'go_to', target: 'z05_r10', current: 0, required: 1, completed: false },
      { id: 'obj_analyze_33hz', description: 'Analyze the 33hz anomaly (TECH ≥ 6)', type: 'examine', target: '33hz_detection', current: 0, required: 1, completed: false },
      { id: 'obj_return_neva_signal', description: 'Report findings to Neva', type: 'talk_to', target: 'neva', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 250, creds: 60, items: ['frequency_scanner'] },
    repeatable: false,
    prerequisites: ['q052_missing_walker'],
    levelRequirement: 6,
  },
  q054_dead_air: {
    id: 'q054_dead_air',
    title: 'DEAD AIR',
    giver: 'sura',
    tier: 2,
    type: 'MULTI',
    description: `one of the relay nodes in the nomad network has gone silent. camp twelve, two hundred kilometers south, stopped responding. sura sent a runner. the runner found the camp evacuated — tents struck, fire cold, vehicles gone. and near the relay: boot prints. military-pattern soles. a retrieval team was there. repair the relay. find out where the camp went.`,
    objectives: [
      { id: 'obj_talk_sura_air', description: 'Talk to Sura about the silent relay', type: 'talk_to', target: 'sura', current: 0, required: 1, completed: false },
      { id: 'obj_reach_open_ground', description: 'Search the Open Ground for relay direction', type: 'go_to', target: 'z05_r03', current: 0, required: 1, completed: false },
      { id: 'obj_examine_relay', description: 'Examine the relay equipment (TECH ≥ 6)', type: 'examine', target: 'transmitter', current: 0, required: 1, completed: false },
      { id: 'obj_return_sura_air', description: 'Report to Sura', type: 'talk_to', target: 'sura', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 175, creds: 45, items: ['relay_repair_kit'] },
    repeatable: false,
    prerequisites: [],
    levelRequirement: 5,
  },

  // ── Zone 12: Iron Bloom Server Farm Quests ──────────────────────────────

  q058_supply_run: {
    id: 'q058_supply_run',
    title: 'SUPPLY RUN',
    giver: 'doss_ib',
    tier: 2,
    type: 'FETCH',
    description: `the facility needs components — a neural interface calibration kit from costa's clinic in the industrial district and medical-grade anesthetic from fex's smuggling network. both are available but neither is easy to transport through hostile territory. coordinate pickup and delivery.`,
    objectives: [
      { id: 'obj_talk_doss_supply', description: 'Talk to Doss about facility needs', type: 'talk_to', target: 'doss_ib', current: 0, required: 1, completed: false },
      { id: 'obj_get_calibration', description: 'Acquire neural calibration kit from Costa (z03)', type: 'talk_to', target: 'dr_costa', current: 0, required: 1, completed: false },
      { id: 'obj_get_anesthetic', description: 'Acquire medical anesthetic from Fex (z09)', type: 'talk_to', target: 'fex', current: 0, required: 1, completed: false },
      { id: 'obj_deliver_doss_supply', description: 'Deliver supplies to Doss', type: 'deliver', target: 'doss_ib', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 200, creds: 50 },
    repeatable: false,
    prerequisites: [],
    levelRequirement: 10,
  },
  q059_morale: {
    id: 'q059_morale',
    title: 'MORALE',
    giver: 'doss_ib',
    tier: 2,
    type: 'FETCH',
    description: `something simpler. the facility's one portable speaker plays the same twelve albums on loop. people are going crazy. doss needs new music. physical media. vinyl, tapes, data drives — anything. a scavenger in the fringe has a cache. the freemarket might have imports. not everything is about helixion. sometimes the resistance needs a new playlist.`,
    objectives: [
      { id: 'obj_talk_doss_morale', description: 'Talk to Doss about the music situation', type: 'talk_to', target: 'doss_ib', current: 0, required: 1, completed: false },
      { id: 'obj_find_music', description: 'Find new physical media (check Fringe or Freemarket)', type: 'collect', target: 'physical_media', current: 0, required: 1, completed: false },
      { id: 'obj_deliver_music', description: 'Deliver to Doss', type: 'deliver', target: 'doss_ib', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 125, creds: 30, items: ['stim_pack', 'stim_pack'] },
    repeatable: false,
    prerequisites: [],
    levelRequirement: 10,
  },
  q060_serranos_hands: {
    id: 'q060_serranos_hands',
    title: "SERRANO'S HANDS",
    giver: 'mira',
    tier: 3,
    type: 'MULTI',
    description: `serrano's neural degradation is progressing — the tremor in the left hand is worse. mira has identified a potential treatment: a neural regeneration compound derived from substrate material. it doesn't exist yet. synthesize it from raw substrate crystal (from the transit system's growth areas, z11), using equipment from the helixion research wing (z01 r05). requires vasik's expertise or TECH ≥ 10. success slows the degradation. not stopped — slowed. how much time it buys depends on factors mira can't control.`,
    objectives: [
      { id: 'obj_talk_mira_hands', description: 'Talk to Mira about Serrano\'s condition', type: 'talk_to', target: 'mira', current: 0, required: 1, completed: false },
      { id: 'obj_get_substrate_crystal', description: 'Acquire raw Substrate crystal (z11 growth areas)', type: 'collect', target: 'substrate_crystal_raw', current: 0, required: 1, completed: false },
      { id: 'obj_use_helixion_equipment', description: 'Access Helixion equipment to synthesize compound (z01 r05)', type: 'go_to', target: 'z01_r05', current: 0, required: 1, completed: false },
      { id: 'obj_synthesize', description: 'Synthesize neural regeneration compound (TECH ≥ 10 or Vasik)', type: 'examine', target: 'helixion_lab_equipment', current: 0, required: 1, completed: false },
      { id: 'obj_return_mira_hands', description: 'Return compound to Mira', type: 'deliver', target: 'mira', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 400, creds: 80, items: ['neural_stabilizer_ib'] },
    repeatable: false,
    prerequisites: [],
    levelRequirement: 12,
  },
  q061_the_picture: {
    id: 'q061_the_picture',
    title: 'THE PICTURE',
    giver: 'cipher',
    tier: 3,
    type: 'SABOTAGE',
    description: `cipher's model needs one thing: the broadcast tower's frequency capture specifications. those specs exist in the helixion server core (z01 r10). the data is encrypted, guarded, and the most sensitive intelligence in the building. acquire it. the specs reveal: the tower converts 33hz into a compliance signal. the mass overwrite. finch's warning made real. but the specs also reveal the tower's vulnerability: the frequency capture array at the peak, built from substrate material, is the critical component. destroy the array and the tower becomes a building.`,
    objectives: [
      { id: 'obj_talk_cipher_picture', description: 'Talk to Cipher about the missing data', type: 'talk_to', target: 'cipher', current: 0, required: 1, completed: false },
      { id: 'obj_reach_server_core', description: 'Reach the Helixion Server Core (z01 r10)', type: 'go_to', target: 'z01_r10', current: 0, required: 1, completed: false },
      { id: 'obj_acquire_specs', description: 'Acquire Broadcast Tower frequency capture specs', type: 'collect', target: 'broadcast_specs', current: 0, required: 1, completed: false },
      { id: 'obj_return_cipher', description: 'Return specs to Cipher', type: 'deliver', target: 'cipher', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 450, creds: 100 },
    repeatable: false,
    prerequisites: [],
    levelRequirement: 13,
  },
  q062_direct_option: {
    id: 'q062_direct_option',
    title: 'THE DIRECT OPTION',
    giver: 'coil',
    tier: 3,
    type: 'SABOTAGE',
    description: `coil has been planning independently. the substrate material being transported through the staging area (z09 r10) is sensitive to specific chemical compounds. acre's expertise (z10 r05) could produce a neutralizing agent that renders the substrate material inert — destroying the tower's organic component without detonation or violence. coordinate between acre and the staging area. the operation directly contradicts serrano's preference for exposure over action.`,
    objectives: [
      { id: 'obj_talk_coil_direct', description: 'Talk to Coil about the sabotage plan', type: 'talk_to', target: 'coil', current: 0, required: 1, completed: false },
      { id: 'obj_coordinate_acre', description: 'Coordinate with Acre for neutralizing compound (z10)', type: 'talk_to', target: 'acre', current: 0, required: 1, completed: false },
      { id: 'obj_get_compound', description: 'Acquire the neutralizing compound', type: 'collect', target: 'neutralizing_compound_coil', current: 0, required: 1, completed: false },
      { id: 'obj_reach_staging', description: 'Reach the staging area (z09 r10)', type: 'go_to', target: 'z09_r10', current: 0, required: 1, completed: false },
      { id: 'obj_apply_compound', description: 'Apply compound to Substrate material in transit', type: 'examine', target: 'substrate_staging', current: 0, required: 1, completed: false },
      { id: 'obj_return_coil', description: 'Report to Coil', type: 'talk_to', target: 'coil', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 400, creds: 75 },
    repeatable: false,
    prerequisites: [],
    levelRequirement: 12,
  },
  q063_the_bridge: {
    id: 'q063_the_bridge',
    title: 'THE BRIDGE',
    giver: 'serrano',
    tier: 4,
    type: 'MULTI',
    description: `the endgame. serrano's counter-frequency generator is complete — calibrated with cipher's data, refined with every test against the substrate exposure in the deep lab. the device creates sixty seconds of clarity during the mass overwrite. one minute where a million people think for themselves simultaneously. serrano believes a minute is enough. carry the generator to the broadcast tower's peak. activate it. find out who's right.`,
    objectives: [
      { id: 'obj_talk_serrano_bridge', description: 'Talk to Serrano about the endgame', type: 'talk_to', target: 'serrano', current: 0, required: 1, completed: false },
      { id: 'obj_receive_generator', description: 'Receive the counter-frequency generator', type: 'collect', target: 'counter_frequency_generator', current: 0, required: 1, completed: false },
      { id: 'obj_reach_tower_peak', description: 'Reach the Broadcast Tower peak (z15)', type: 'go_to', target: 'z15_r10', current: 0, required: 1, completed: false },
      { id: 'obj_activate_device', description: 'Activate the counter-frequency generator', type: 'examine', target: 'tower_frequency_array', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 1000, creds: 0 },
    repeatable: false,
    prerequisites: ['q061_the_picture'],
    levelRequirement: 15,
  },

  // ── Zone 13: Black Market Warrens Quests ────────────────────────────────

  q064_market_correction: {
    id: 'q064_market_correction',
    title: 'MARKET CORRECTION',
    giver: 'flicker',
    tier: 2,
    type: 'INVESTIGATE',
    description: `a vendor in the bazaar is selling compromised stims — neural boosters contaminated with a helixion tracking compound. buyers who use them become mesh-visible for 48 hours. flicker has identified the contamination but can't prove if the vendor is doing it deliberately. buy a stim. have it analyzed. determine if the vendor is a helixion agent or a patsy.`,
    objectives: [
      { id: 'obj_talk_flicker_mc', description: 'Talk to Flicker about the contaminated stims', type: 'talk_to', target: 'flicker', current: 0, required: 1, completed: false },
      { id: 'obj_buy_stim', description: 'Buy a contaminated stim from the bazaar', type: 'go_to', target: 'z13_r02', current: 0, required: 1, completed: false },
      { id: 'obj_analyze_stim', description: 'Have the stim analyzed (Acre, Mira, or Patch)', type: 'talk_to', target: 'acre', current: 0, required: 1, completed: false },
      { id: 'obj_return_flicker_mc', description: 'Return findings to Flicker', type: 'talk_to', target: 'flicker', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 200, creds: 50 },
    repeatable: false,
    prerequisites: [],
    levelRequirement: 10,
  },
  q065_the_prototype: {
    id: 'q065_the_prototype',
    title: 'THE PROTOTYPE',
    giver: 'glass',
    tier: 3,
    type: 'FETCH',
    description: `a chrysalis-adjacent neural interface prototype is in transit through the abandoned transit system. helixion's agent zero is also aware of it. intercept the shipment at central station before agent zero's courier does. the data on the prototype feeds iron bloom intelligence. glass wants the hardware.`,
    objectives: [
      { id: 'obj_talk_glass_proto', description: 'Talk to Glass about the prototype', type: 'talk_to', target: 'glass', current: 0, required: 1, completed: false },
      { id: 'obj_reach_central', description: 'Reach Central Station in time', type: 'go_to', target: 'z11_r04', current: 0, required: 1, completed: false },
      { id: 'obj_intercept_package', description: 'Intercept the prototype shipment', type: 'examine', target: 'prototype_shipment', current: 0, required: 1, completed: false },
      { id: 'obj_return_glass_proto', description: 'Deliver prototype to Glass', type: 'talk_to', target: 'glass', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 275, creds: 70, items: ['gallery_neural'] },
    repeatable: false,
    prerequisites: [],
    levelRequirement: 12,
  },
  q066_the_bypass: {
    id: 'q066_the_bypass',
    title: 'THE BYPASS',
    giver: 'vice',
    tier: 2,
    type: 'MULTI',
    description: `vice needs a neural bypass module. their interface is degrading. the noise is constant. glass sells them — 200 creds. vice has nothing. you can buy it (expensive), negotiate with glass (difficult), find an alternative source (time-consuming), or walk away (free). the reward is minimal. the quest's value is moral.`,
    objectives: [
      { id: 'obj_talk_vice', description: 'Talk to Vice about the neural bypass', type: 'talk_to', target: 'vice', current: 0, required: 1, completed: false },
      { id: 'obj_acquire_bypass', description: 'Acquire a neural bypass module', type: 'collect', target: 'neural_bypass_module', current: 0, required: 1, completed: false },
      { id: 'obj_deliver_vice', description: 'Deliver the bypass module to Vice', type: 'deliver', target: 'vice', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 125, creds: 10 },
    repeatable: false,
    prerequisites: [],
    levelRequirement: 10,
  },
  q067_the_oldest_thing: {
    id: 'q067_the_oldest_thing',
    title: 'THE OLDEST THING',
    giver: 'relic',
    tier: 3,
    type: 'INVESTIGATE',
    description: `relic has identified a substrate-intentional artifact in the substrate level — not a growth, not an accident, but something the substrate appears to have created deliberately. they need it documented. not removed — documented. go to the substrate level. find it. record it. bring the documentation back. earn relic's complete substrate knowledge and a permanent artifact.`,
    objectives: [
      { id: 'obj_talk_relic_oldest', description: 'Talk to Relic about the Substrate artifact', type: 'talk_to', target: 'relic', current: 0, required: 1, completed: false },
      { id: 'obj_reach_substrate', description: 'Reach the Substrate Level', type: 'go_to', target: 'z14_r01', current: 0, required: 1, completed: false },
      { id: 'obj_document_artifact', description: 'Document the intentional artifact', type: 'examine', target: 'substrate_intentional_artifact', current: 0, required: 1, completed: false },
      { id: 'obj_return_relic_oldest', description: 'Return documentation to Relic', type: 'talk_to', target: 'relic', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 350, creds: 80, items: ['substrate_artifact'] },
    repeatable: false,
    prerequisites: [],
    levelRequirement: 12,
  },
  // ── Zone 14: The Substrate Level Quests ──────────────────────────────────

  q068_the_answer: {
    id: 'q068_the_answer',
    title: 'THE ANSWER',
    giver: 'threshold',
    tier: 4,
    type: 'DELIVERY',
    description: `the substrate has a message. not the 33hz — that's the question. this is the answer. threshold has spent four years translating it. the message is stored in a resonance crystal — compressed experience, encoded in crystalline architecture. carry the crystal to the tower root. combine it with serrano's counter-frequency generator. deploy the combined device. broadcast the substrate's real question — not the captured version, not the weaponized version. the real one. the game's optimal endgame resolution.`,
    objectives: [
      { id: 'obj_talk_threshold_answer', description: 'Talk to Threshold about the Substrate\'s message', type: 'talk_to', target: 'threshold', current: 0, required: 1, completed: false },
      { id: 'obj_receive_crystal', description: 'Receive the message crystal from Threshold', type: 'collect', target: 'substrate_message_crystal', current: 0, required: 1, completed: false },
      { id: 'obj_reach_tower_root', description: 'Reach the Tower Root', type: 'go_to', target: 'z14_r15', current: 0, required: 1, completed: false },
      { id: 'obj_combine_devices', description: 'Combine crystal with Serrano\'s generator at deployment point', type: 'examine', target: 'deployment_point', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 1000, creds: 0, items: ['substrate_message_crystal'] },
    repeatable: false,
    prerequisites: ['q063_the_bridge'],
    levelRequirement: 0,
  },
  q070_dwells_return: {
    id: 'q070_dwells_return',
    title: 'DWELL\'S RETURN',
    giver: 'dwell',
    tier: 3,
    type: 'ESCORT',
    description: `dwell has been in the memory chamber for six months. iron bloom thinks they're dead. they're not dead — they're at peace in a way that is either enlightenment or erasure. you can convince them to return. or you can let them stay. both have value. if they return, iron bloom gains a substrate specialist whose understanding is experiential, not theoretical. if they stay, the substrate gains a permanent human interface in its deepest memory. the choice is real.`,
    objectives: [
      { id: 'obj_talk_dwell', description: 'Talk to Dwell in the Memory Chamber', type: 'talk_to', target: 'dwell', current: 0, required: 1, completed: false },
      { id: 'obj_convince_dwell', description: 'Convince Dwell to return (COOL ≥ 8) or let them stay', type: 'talk_to', target: 'dwell', current: 0, required: 1, completed: false },
      { id: 'obj_escort_or_report', description: 'Escort Dwell to Iron Bloom or report their status', type: 'go_to', target: 'z12_r01', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 300, creds: 50 },
    repeatable: false,
    prerequisites: [],
    levelRequirement: 0,
  },

  // ── Zone 15: The Broadcast Tower Quests (Endgame Deployments) ───────────

  q071_the_bridge_deploy: {
    id: 'q071_the_bridge_deploy',
    title: 'THE BRIDGE — DEPLOY',
    giver: 'serrano',
    tier: 4,
    type: 'MULTI',
    description: `the endgame. serrano's counter-frequency generator is in your hands. the broadcast tower's peak — the frequency capture array — is forty stories above the substrate. climb the tower. reach the array. deploy the generator in the central socket. one minute of clarity for a million people. serrano believes a minute is enough. find out who's right.`,
    objectives: [
      { id: 'obj_carry_generator', description: 'Carry the counter-frequency generator', type: 'collect', target: 'counter_frequency_generator', current: 0, required: 1, completed: false },
      { id: 'obj_enter_tower', description: 'Enter the Broadcast Tower', type: 'go_to', target: 'z15_r10', current: 0, required: 1, completed: false },
      { id: 'obj_confront_harrow', description: 'Get past the Confrontation platform', type: 'go_to', target: 'z15_r11', current: 0, required: 1, completed: false },
      { id: 'obj_reach_peak', description: 'Reach the Frequency Capture Array', type: 'go_to', target: 'z15_r12', current: 0, required: 1, completed: false },
      { id: 'obj_deploy_generator', description: 'Deploy the counter-frequency generator', type: 'examine', target: 'tower_frequency_array', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 1500, creds: 0 },
    repeatable: false,
    prerequisites: ['q063_the_bridge'],
    levelRequirement: 15,
  },
  q072_the_answer_deploy: {
    id: 'q072_the_answer_deploy',
    title: 'THE ANSWER — DEPLOY',
    giver: 'threshold',
    tier: 4,
    type: 'MULTI',
    description: `the optimal endgame. threshold's resonance crystal combined with serrano's generator. not just clarity — truth. the substrate's real question, broadcast at citywide volume through the weapon designed to silence it. carry the combined device to the frequency capture array. deploy it. broadcast the question the substrate has been asking since before the city was built. "are you part of me?" asked at full volume, with the real answer: a choice.`,
    objectives: [
      { id: 'obj_carry_crystal', description: 'Carry the combined crystal-generator device', type: 'collect', target: 'substrate_message_crystal', current: 0, required: 1, completed: false },
      { id: 'obj_enter_tower_answer', description: 'Enter the Broadcast Tower', type: 'go_to', target: 'z15_r10', current: 0, required: 1, completed: false },
      { id: 'obj_confront_harrow_answer', description: 'Get past the Confrontation platform', type: 'go_to', target: 'z15_r11', current: 0, required: 1, completed: false },
      { id: 'obj_reach_peak_answer', description: 'Reach the Frequency Capture Array', type: 'go_to', target: 'z15_r12', current: 0, required: 1, completed: false },
      { id: 'obj_deploy_crystal', description: 'Deploy the combined device — broadcast the real question', type: 'examine', target: 'tower_frequency_array', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 2000, creds: 0 },
    repeatable: false,
    prerequisites: ['q068_the_answer', 'q063_the_bridge'],
    levelRequirement: 15,
  },

  // ── Zone 16: Helixion Lab — Raid Completion Tracking ──────────────────

  q073_lab_normal: {
    id: 'q073_lab_normal',
    title: 'THE LAB — NORMAL',
    giver: 'system',
    tier: 4,
    type: 'ELIMINATE',
    description: `the helixion lab. raid dungeon beneath the campus. three bosses. ten rooms. the combat endgame. clear it on normal difficulty. party recommended.`,
    objectives: [
      { id: 'obj_enter_lab', description: 'Enter the Helixion Lab', type: 'go_to', target: 'z16_r01', current: 0, required: 1, completed: false },
      { id: 'obj_defeat_naren', description: 'Defeat Naren the Forge Master', type: 'kill', target: 'naren', current: 0, required: 1, completed: false },
      { id: 'obj_defeat_fell', description: 'Defeat Commander Fell', type: 'kill', target: 'commander_fell', current: 0, required: 1, completed: false },
      { id: 'obj_defeat_overwrite', description: 'Defeat the Overwrite', type: 'kill', target: 'the_overwrite', current: 0, required: 1, completed: false },
      { id: 'obj_reach_well', description: 'Reach the Well', type: 'go_to', target: 'z16_r10', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 1500, creds: 200, items: ['chrysalis_data'] },
    repeatable: true,
    prerequisites: [],
    levelRequirement: 14,
  },
  q074_lab_hard: {
    id: 'q074_lab_hard',
    title: 'THE LAB — HARD',
    giver: 'system',
    tier: 5,
    type: 'ELIMINATE',
    description: `the lab again. harder. enemies hit harder, have more health, bosses gain new abilities. the loot scales. you know the rooms. now survive them at full power.`,
    objectives: [
      { id: 'obj_enter_lab_h', description: 'Enter the Helixion Lab (Hard)', type: 'go_to', target: 'z16_r01', current: 0, required: 1, completed: false },
      { id: 'obj_defeat_naren_h', description: 'Defeat Naren the Forge Master (Hard)', type: 'kill', target: 'naren', current: 0, required: 1, completed: false },
      { id: 'obj_defeat_fell_h', description: 'Defeat Commander Fell (Hard)', type: 'kill', target: 'commander_fell', current: 0, required: 1, completed: false },
      { id: 'obj_defeat_overwrite_h', description: 'Defeat the Overwrite (Hard)', type: 'kill', target: 'the_overwrite', current: 0, required: 1, completed: false },
      { id: 'obj_reach_well_h', description: 'Reach the Well (Hard)', type: 'go_to', target: 'z16_r10', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 2500, creds: 400, items: ['lab_security_codes'] },
    repeatable: true,
    prerequisites: ['q073_lab_normal'],
    levelRequirement: 17,
  },
  q075_lab_nightmare: {
    id: 'q075_lab_nightmare',
    title: 'THE LAB — NIGHTMARE',
    giver: 'system',
    tier: 5,
    type: 'ELIMINATE',
    description: `nightmare difficulty. the lab at its worst. enemies at maximum power. bosses gain new abilities. the alternate boss is at full strength. the sovereign frequency implant drops here — if you solve all three puzzles and survive what wakes up in the well.`,
    objectives: [
      { id: 'obj_enter_lab_n', description: 'Enter the Helixion Lab (Nightmare)', type: 'go_to', target: 'z16_r01', current: 0, required: 1, completed: false },
      { id: 'obj_defeat_naren_n', description: 'Defeat Naren the Forge Master (Nightmare)', type: 'kill', target: 'naren', current: 0, required: 1, completed: false },
      { id: 'obj_defeat_fell_n', description: 'Defeat Commander Fell (Nightmare)', type: 'kill', target: 'commander_fell', current: 0, required: 1, completed: false },
      { id: 'obj_defeat_overwrite_n', description: 'Defeat the Overwrite (Nightmare)', type: 'kill', target: 'the_overwrite', current: 0, required: 1, completed: false },
      { id: 'obj_reach_well_n', description: 'Reach the Well (Nightmare)', type: 'go_to', target: 'z16_r10', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 4000, creds: 600, items: ['overwrite_neural_core'] },
    repeatable: true,
    prerequisites: ['q074_lab_hard'],
    levelRequirement: 19,
  },
};

// ── Quest State Management ──────────────────────────────────────────────────

export function getAvailableQuests(character: MudCharacter, world: MudWorldState): Quest[] {
  return Object.values(QUEST_REGISTRY).filter(q => {
    if (world.activeQuests.includes(q.id)) return false;
    if (world.completedQuests.includes(q.id) && !q.repeatable) return false;
    if ((world.declinedQuests ?? []).includes(q.id)) return false;
    if (q.levelRequirement && character.level < q.levelRequirement) return false;
    if (q.prerequisites.some(p => !world.completedQuests.includes(p))) return false;
    return true;
  });
}

export function getActiveQuests(world: MudWorldState): Quest[] {
  return world.activeQuests
    .map(id => QUEST_REGISTRY[id])
    .filter(Boolean);
}

export function getDeclinedQuests(world: MudWorldState): Quest[] {
  return (world.declinedQuests ?? [])
    .map(id => QUEST_REGISTRY[id])
    .filter(Boolean);
}

export function getNPCQuests(npcId: string, character: MudCharacter, world: MudWorldState): Quest[] {
  return getAvailableQuests(character, world).filter(q => q.giver === npcId);
}

export function declineQuest(
  handle: string, questId: string,
): { success: boolean; error?: string } {
  const quest = QUEST_REGISTRY[questId];
  if (!quest) return { success: false, error: 'job not found' };
  const world = loadWorld(handle);
  // Remove from active if it was active
  world.activeQuests = world.activeQuests.filter(id => id !== questId);
  // Clean up progress flags so re-accepting starts fresh
  for (const obj of quest.objectives) {
    delete world.worldFlags[`quest_${questId}_${obj.id}`];
  }
  // Add to declined
  if (!world.declinedQuests) world.declinedQuests = [];
  if (!world.declinedQuests.includes(questId)) {
    world.declinedQuests.push(questId);
  }
  saveWorld(handle, world);
  return { success: true };
}

export function undeclineQuest(
  handle: string, questId: string,
): { success: boolean; error?: string } {
  const quest = QUEST_REGISTRY[questId];
  if (!quest) return { success: false, error: 'job not found' };
  const world = loadWorld(handle);
  if (!world.declinedQuests) world.declinedQuests = [];
  world.declinedQuests = world.declinedQuests.filter(id => id !== questId);
  saveWorld(handle, world);
  return { success: true };
}

export function startQuest(
  handle: string, questId: string,
): { success: boolean; quest?: Quest; error?: string } {
  const quest = QUEST_REGISTRY[questId];
  if (!quest) return { success: false, error: 'job not found' };

  const world = loadWorld(handle);
  if (world.activeQuests.includes(questId)) return { success: false, error: 'already active' };
  if (world.completedQuests.includes(questId) && !quest.repeatable) return { success: false, error: 'already completed' };

  // Reset objectives for repeatable quests
  const freshQuest = {
    ...quest,
    objectives: quest.objectives.map(o => ({ ...o, current: 0, completed: false })),
  };

  world.activeQuests.push(questId);
  saveWorld(handle, world);
  return { success: true, quest: freshQuest };
}

// ── Objective Tracking ──────────────────────────────────────────────────────

export interface QuestProgress {
  questId: string;
  objectiveId: string;
  completed: boolean;
  questComplete: boolean;
}

// Track quest progress. Returns which objectives/quests were just completed.
export function trackObjective(
  handle: string,
  type: QuestObjective['type'],
  target: string,
  amount: number = 1,
): QuestProgress[] {
  const world = loadWorld(handle);
  const results: QuestProgress[] = [];

  for (const questId of world.activeQuests) {
    const quest = QUEST_REGISTRY[questId];
    if (!quest) continue;

    // Load quest progress from world flags
    for (const obj of quest.objectives) {
      if (obj.completed) continue;
      if (obj.type !== type) continue;

      // Match target
      let matches = false;
      if (type === 'go_to') matches = target === obj.target;
      else if (type === 'talk_to') matches = target === obj.target;
      else if (type === 'collect') matches = target === obj.target;
      else if (type === 'deliver') matches = target === obj.target;
      else if (type === 'examine') matches = target === obj.target;
      else if (type === 'kill') matches = target === obj.target;

      if (!matches) continue;

      // Get stored progress
      const flagKey = `quest_${questId}_${obj.id}`;
      const current = (world.worldFlags[flagKey] as number) ?? 0;
      const newVal = Math.min(obj.required, current + amount);
      world.worldFlags[flagKey] = newVal;
      obj.current = newVal;

      if (newVal >= obj.required) {
        obj.completed = true;
        const allDone = quest.objectives.every(o => {
          const fk = `quest_${questId}_${o.id}`;
          return ((world.worldFlags[fk] as number) ?? 0) >= o.required;
        });

        results.push({
          questId, objectiveId: obj.id,
          completed: true, questComplete: allDone,
        });
      }
    }
  }

  saveWorld(handle, world);
  return results;
}

// ── Quest Completion ────────────────────────────────────────────────────────

export function completeQuest(
  handle: string, character: MudCharacter, questId: string,
): { rewards: QuestReward; leveledUp: boolean; newLevel?: number } | null {
  const quest = QUEST_REGISTRY[questId];
  if (!quest) return null;

  const world = loadWorld(handle);

  // Remove from active, add to completed
  world.activeQuests = world.activeQuests.filter(id => id !== questId);
  world.completedQuests.push(questId);

  // Clean up progress flags
  for (const obj of quest.objectives) {
    delete world.worldFlags[`quest_${questId}_${obj.id}`];
  }

  saveWorld(handle, world);

  // Apply rewards
  const rewards = quest.rewards;
  if (rewards.creds) character.currency.creds += rewards.creds;
  if (rewards.scrip) character.currency.scrip += rewards.scrip;
  if (rewards.items) {
    for (const itemId of rewards.items) {
      const item = createItem(itemId);
      if (item) {
        const existing = character.inventory.find(i => i.id === itemId && i.stackable);
        if (existing) existing.quantity += 1;
        else character.inventory.push(item);
      }
    }
  }

  // XP
  let leveledUp = false;
  let newLevel: number | undefined;
  if (rewards.xp) {
    const result = addXP(character, rewards.xp);
    leveledUp = result.leveled;
    newLevel = result.newLevel;
  }

  // Disposition boost with quest giver
  if (quest.giver) {
    updateNPCRelation(handle, quest.giver, {
      questsComplete: [...(getNPCQuestsComplete(handle, quest.giver)), questId],
    });
  }

  return { rewards, leveledUp, newLevel };
}

function getNPCQuestsComplete(handle: string, npcId: string): string[] {
  const rel = getNPCRelation(handle, npcId);
  return rel?.questsComplete ?? [];
}

// ── Check if a quest objective is ready to complete ─────────────────────────

export function getQuestObjectiveProgress(
  handle: string, questId: string,
): { objectives: Array<{ id: string; description: string; current: number; required: number; done: boolean }> } | null {
  const quest = QUEST_REGISTRY[questId];
  if (!quest) return null;

  const world = loadWorld(handle);
  return {
    objectives: quest.objectives.map(obj => {
      const flagKey = `quest_${questId}_${obj.id}`;
      const current = (world.worldFlags[flagKey] as number) ?? 0;
      return {
        id: obj.id,
        description: obj.description,
        current,
        required: obj.required,
        done: current >= obj.required,
      };
    }),
  };
}

export function isQuestComplete(handle: string, questId: string): boolean {
  const progress = getQuestObjectiveProgress(handle, questId);
  if (!progress) return false;
  return progress.objectives.every(o => o.done);
}
