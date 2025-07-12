import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";

export type QueryParams = Record<string, any>;

@Injectable({ providedIn: "root" })
export class ApiService {
	constructor(private http: HttpClient) {}

	// GET
	get<T>(baseUrl: string, endpoint: string, qp?: QueryParams, headers?: HttpHeaders): Observable<T> {
		const options = this.buildOptions(qp, headers);
		return this.http.get<T>(`${baseUrl}/${endpoint}`, options).pipe(catchError(this.handleError));
	}

	// GET by ID
	getById<T>(baseUrl: string, endpoint: string, id: number | string, qp?: QueryParams, headers?: HttpHeaders): Observable<T> {
		const options = this.buildOptions(qp, headers);
		return this.http.get<T>(`${baseUrl}/${endpoint}/${id}`, options).pipe(catchError(this.handleError));
	}

	// POST
	post<T>(baseUrl: string, endpoint: string, data: any, qp?: QueryParams, headers?: HttpHeaders): Observable<T> {
		const options = this.buildOptions(qp, headers, data instanceof FormData);
		const body = data instanceof FormData ? data : JSON.stringify(data);
		return this.http.post<T>(`${baseUrl}/${endpoint}`, body, options).pipe(catchError(this.handleError));
	}

	// PUT / UPDATE
	update<T>(baseUrl: string, endpoint: string, id: number | string, data: any, qp?: QueryParams, headers?: HttpHeaders): Observable<T> {
		const options = this.buildOptions(qp, headers);
		return this.http.put<T>(`${baseUrl}/${endpoint}/${id}`, JSON.stringify(data), options).pipe(catchError(this.handleError));
	}

	// DELETE
	delete<T>(baseUrl: string, endpoint: string, id: number | string, headers?: HttpHeaders): Observable<T> {
		const options = this.buildOptions(undefined, headers);
		return this.http.delete<T>(`${baseUrl}/${endpoint}/${id}`, options).pipe(catchError(this.handleError));
	}

	// GET Local file as blob
	getLocalFile(url: string): Observable<Blob> {
		const headers = new HttpHeaders({
			"Content-Type": "application/octet-stream",
			"Content-Disposition": "attachment",
		});
		return this.http.get(url, { headers, responseType: "blob" }).pipe(catchError(this.handleError));
	}

	// -------------------------------
	// 🔒 Private Helpers
	// -------------------------------

	private buildOptions(
		qp?: QueryParams,
		headers?: HttpHeaders,
		isFormData: boolean = false
	): {
		headers: HttpHeaders;
		params: HttpParams;
	} {
		let params = new HttpParams();
		if (qp) {
			Object.entries(qp).forEach(([key, value]) => {
				if (value !== null && value !== undefined && value !== "") {
					params = params.set(key, value);
				}
			});
		}

		const defaultHeaders = isFormData
			? new HttpHeaders() // Let browser set content-type for FormData
			: new HttpHeaders({ "Content-Type": "application/json" });

		return {
			headers: headers || defaultHeaders,
			params,
		};
	}

	private handleError(error: HttpErrorResponse): Observable<never> {
		const errorMsg = error.error?.message || error.statusText || "Unknown error";
		console.error(`[API Error] ${error.status}: ${errorMsg}`);
		return throwError(() => new Error(errorMsg));
	}
}
