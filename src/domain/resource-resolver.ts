import providerConfig from '../data/resource-providers.json';

export type EmbedType = 'iframe' | 'object' | 'image';

export interface IframeAttributes {
    allow?: string;
    referrerpolicy?: ReferrerPolicy;
    sandbox?: string;
}

export interface ResolvedResource {
    embedUrl: string;
    embedType: EmbedType;
    providerId: string;
    iframeAttributes?: IframeAttributes;
}

interface ProviderRule {
    id: string;
    hostnames?: string[];
    extensions?: string[];
    embedType: EmbedType;
    matchPattern?: string;
    embedUrlTemplate?: string;
    iframeAttributes?: IframeAttributes;
}

export interface ResourceResolver {
    resolve(uri: string): ResolvedResource;
}

export function createResourceResolver(): ResourceResolver {
    const providers = providerConfig.providers as ProviderRule[];
    const fallback = providerConfig.fallback as { embedType: EmbedType };

    function getHostname(uri: string): string | null {
        try {
            return new URL(uri).hostname;
        } catch {
            return null;
        }
    }

    function getExtension(uri: string): string | null {
        const path = uri.split('?')[0].split('#')[0];
        const dotIndex = path.lastIndexOf('.');
        if (dotIndex === -1) {
            return null;
        }
        return path.slice(dotIndex).toLowerCase();
    }

    function findHostnameProvider(uri: string): ProviderRule | undefined {
        const hostname = getHostname(uri);
        if (!hostname) {
            return undefined;
        }
        return providers.find((provider) => provider.hostnames?.includes(hostname));
    }

    function findExtensionProvider(uri: string): ProviderRule | undefined {
        const extension = getExtension(uri);
        if (!extension) {
            return undefined;
        }
        return providers.find((provider) => provider.extensions?.includes(extension));
    }

    function buildEmbedUrl(uri: string, provider: ProviderRule): string {
        if (!provider.matchPattern || !provider.embedUrlTemplate) {
            return uri;
        }

        const match = uri.match(new RegExp(provider.matchPattern));
        if (!match) {
            return uri;
        }

        if (provider.id === 'musescore') {
            return provider.embedUrlTemplate.replace('{path}', match[1]);
        }

        return provider.embedUrlTemplate.replace('{id}', match[1]);
    }

    function resolve(uri: string): ResolvedResource {
        const hostnameProvider = findHostnameProvider(uri);
        if (hostnameProvider) {
            return {
                embedUrl: buildEmbedUrl(uri, hostnameProvider),
                embedType: hostnameProvider.embedType,
                providerId: hostnameProvider.id,
                iframeAttributes: hostnameProvider.iframeAttributes
            };
        }

        const extensionProvider = findExtensionProvider(uri);
        if (extensionProvider) {
            return {
                embedUrl: uri,
                embedType: extensionProvider.embedType,
                providerId: extensionProvider.id,
                iframeAttributes: extensionProvider.iframeAttributes
            };
        }

        return {
            embedUrl: uri,
            embedType: fallback.embedType,
            providerId: 'fallback'
        };
    }

    return { resolve };
}