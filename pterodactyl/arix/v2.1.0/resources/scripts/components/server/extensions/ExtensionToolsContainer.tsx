import React from 'react';
import { ServerContext } from '@/state/server';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import { Button } from '@/components/elements/button/index';
import { SparklesIcon } from '@heroicons/react/outline';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';

export default () => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const extensions = useStoreState((state: ApplicationStore) => state.settings.data!.arix.advanced.extensions);

    return (
        <ServerContentBlock title={'SKA Extensions'} icon={SparklesIcon}>
            <div className='space-y-4'>
                <TitledGreyBox title={'Quick tools'}>
                    <p className='text-sm text-gray-400'>These lightweight tools are available for the current Pterodactyl 1.14.x setup.</p>
                    <div className='mt-3 grid gap-3 md:grid-cols-2'>
                        {extensions.subdomainManager && (
                            <div className='rounded-lg border border-gray-600 bg-neutral-800/70 p-4'>
                                <p className='font-medium text-gray-100'>Subdomain Manager</p>
                                <p className='mt-2 text-sm text-gray-400'>Use the configured template to generate a subdomain for this server.</p>
                                <p className='mt-3 text-xs text-gray-500'>Template: {extensions.subdomainTemplate}</p>
                            </div>
                        )}
                        {extensions.motdMaker && (
                            <div className='rounded-lg border border-gray-600 bg-neutral-800/70 p-4'>
                                <p className='font-medium text-gray-100'>MOTD Maker</p>
                                <p className='mt-2 text-sm text-gray-400'>Create a server message using the configured MOTD preset.</p>
                                <p className='mt-3 text-xs text-gray-500'>Template: {extensions.motdTemplate}</p>
                            </div>
                        )}
                        {extensions.versionChanger && (
                            <div className='rounded-lg border border-gray-600 bg-neutral-800/70 p-4'>
                                <p className='font-medium text-gray-100'>Version Changer</p>
                                <p className='mt-2 text-sm text-gray-400'>Switch the server to the preferred version preset.</p>
                                <p className='mt-3 text-xs text-gray-500'>Target: {extensions.targetVersion}</p>
                            </div>
                        )}
                        {extensions.autoSuspension && (
                            <div className='rounded-lg border border-gray-600 bg-neutral-800/70 p-4'>
                                <p className='font-medium text-gray-100'>Auto Suspension</p>
                                <p className='mt-2 text-sm text-gray-400'>Apply the configured suspension policy after the threshold is reached.</p>
                                <p className='mt-3 text-xs text-gray-500'>Threshold: {extensions.suspensionThreshold} day(s)</p>
                            </div>
                        )}
                    </div>
                </TitledGreyBox>
                <TitledGreyBox title={'Server status'}>
                    <p className='text-sm text-gray-400'>Current server UUID: {uuid}</p>
                    <Button className='mt-3'>Apply extension preset</Button>
                </TitledGreyBox>
            </div>
        </ServerContentBlock>
    );
};
