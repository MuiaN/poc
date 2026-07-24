import { CountryProfile } from "@/components/pages/CountryProfile";

export default async function Page({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  return <CountryProfile countryKey={key} />;
}
    