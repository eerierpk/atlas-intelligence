/** Bundled asset URLs — survives Cloudflare / SSR deploys where `/public` paths can 404. */
import dicomObjectSchematic from "@/assets/journey/dicom-object-schematic.svg?url";
import diagramCtDose from "@/assets/journey/diagram-ct-dose.svg?url";
import diagramEcosystem from "@/assets/journey/diagram-ecosystem.svg?url";
import diagramMriZones from "@/assets/journey/diagram-mri-zones.svg?url";
import diagramPetctFusion from "@/assets/journey/diagram-petct-fusion.svg?url";
import sampleMriSchematic from "@/assets/journey/sample-mri-schematic.svg?url";

export const journeyAssetUrls = {
  dicomObjectSchematic,
  diagramEcosystem,
  diagramMriZones,
  diagramCtDose,
  diagramPetctFusion,
  sampleMriSchematic,
} as const;
