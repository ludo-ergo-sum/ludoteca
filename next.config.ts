import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Il driver mongodb ha dipendenze opzionali (kerberos, snappy, aws4, ...)
  // non installate: senza questa esclusione Next tenta di bundlarle e la
  // build fallisce.
  serverExternalPackages: ["mongodb"],
};

export default nextConfig;
