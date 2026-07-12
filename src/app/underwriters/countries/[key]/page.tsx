import { CountryProfile } from "@/components/pages/CountryProfile";

    export default function Page({ params }: { params: { key: string } }) {
      return <CountryProfile countryKey={params.key} />;
    }
    