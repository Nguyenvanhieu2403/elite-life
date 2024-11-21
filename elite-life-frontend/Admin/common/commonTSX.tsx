import { Messages } from 'primereact/messages';
import { isJsonString } from '../common/common';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context';
import { Toast } from 'primereact/toast';

interface CatchAxiosErr {
    router: AppRouterInstance, e: any, toast: React.RefObject<Toast>
}
interface DisplayErrMessage {
    message: React.RefObject<Messages>, isExport: boolean, response: any
}

export const catchAxiosError = (params: CatchAxiosErr) => {
    const { e, router, toast } = params
    switch (e.response.data.statusCode) {
        case 401:
            router.push('/auth/login');
            break;
        case 403:
            toast.current?.show({ severity: 'error', summary: 'Thất bại', detail: 'Bạn không có quyền thực hiện thao tác này', life: 3000 });
            break;
        default:
            console.log(`${e.response.data} detected`);
            break;
    }
}

export const displayErrorMessage = (params: DisplayErrMessage) => {
    const { isExport, message, response } = params
    return (
        message.current?.show({
            severity: 'error', summary: 'Thao tác không thành công', sticky: true, content: (
                <>
                    <div className="max-w-[900px]">
                        {
                            isJsonString(response.message) ?
                                Object.keys(response.message).map((key, index) => (
                                    <div className="ml-2" key={index}>
                                        {response.message[key]}
                                    </div>
                                ))
                                :
                                <div className="ml-2">{response.message}</div>
                        }
                        {isExport == true ? <a href={`/file${response.data}`} target="_blank"> Tải xuống file lỗi</a> : ""}
                    </div>
                </>
            )
        })
    )
}